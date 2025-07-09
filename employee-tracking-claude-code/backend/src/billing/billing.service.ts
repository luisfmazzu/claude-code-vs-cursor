import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../config/database.config';
import Stripe from 'stripe';

export interface CreateSubscriptionDto {
  priceId: string;
  paymentMethodId?: string;
}

export interface UpdateSubscriptionDto {
  priceId?: string;
  paymentMethodId?: string;
}

export interface BillingInfo {
  customerId: string;
  subscriptionId?: string;
  plan: string;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: {
    type: string;
    last4?: string;
    brand?: string;
  };
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: Date;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
}

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseConfig: DatabaseConfig,
  ) {
    // Initialize Stripe with test key for demo
    // In production, use the real secret key from environment
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_demo_key',
      {
        apiVersion: '2024-12-18.acacia',
      }
    );
  }

  async getBillingInfo(companyId: string): Promise<BillingInfo> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Get company billing information
      const { data: company, error } = await supabase
        .from('companies')
        .select('stripe_customer_id, stripe_subscription_id, plan, subscription_status')
        .eq('id', companyId)
        .single();

      if (error || !company) {
        throw new NotFoundException('Company not found');
      }

      // If no Stripe customer exists, create one
      if (!company.stripe_customer_id) {
        const customer = await this.createCustomer(companyId);
        company.stripe_customer_id = customer.id;
      }

      // Mock billing info for demo purposes
      return {
        customerId: company.stripe_customer_id,
        subscriptionId: company.stripe_subscription_id,
        plan: company.plan || 'starter',
        status: company.subscription_status || 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'visa',
        },
      };
    } catch (error) {
      console.error('Error fetching billing info:', error);
      throw new BadRequestException('Failed to fetch billing information');
    }
  }

  async createSubscription(
    companyId: string,
    createDto: CreateSubscriptionDto,
  ): Promise<any> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Get company
      const { data: company } = await supabase
        .from('companies')
        .select('stripe_customer_id, name')
        .eq('id', companyId)
        .single();

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      let customerId = company.stripe_customer_id;

      // Create customer if doesn't exist
      if (!customerId) {
        const customer = await this.createCustomer(companyId);
        customerId = customer.id;
      }

      // Simulate subscription creation for demo
      const mockSubscription = {
        id: `sub_${Date.now()}`,
        customer: customerId,
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        items: {
          data: [
            {
              price: {
                id: createDto.priceId,
                unit_amount: this.getPriceAmount(createDto.priceId),
              },
            },
          ],
        },
      };

      // Update company with subscription info
      const planName = this.getPlanFromPriceId(createDto.priceId);
      await supabase
        .from('companies')
        .update({
          stripe_subscription_id: mockSubscription.id,
          plan: planName,
          subscription_status: 'active',
        })
        .eq('id', companyId);

      return mockSubscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new BadRequestException('Failed to create subscription');
    }
  }

  async updateSubscription(
    companyId: string,
    updateDto: UpdateSubscriptionDto,
  ): Promise<any> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Get company subscription
      const { data: company } = await supabase
        .from('companies')
        .select('stripe_subscription_id')
        .eq('id', companyId)
        .single();

      if (!company?.stripe_subscription_id) {
        throw new NotFoundException('No active subscription found');
      }

      // Mock subscription update
      if (updateDto.priceId) {
        const planName = this.getPlanFromPriceId(updateDto.priceId);
        await supabase
          .from('companies')
          .update({ plan: planName })
          .eq('id', companyId);
      }

      return {
        id: company.stripe_subscription_id,
        status: 'active',
        message: 'Subscription updated successfully',
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new BadRequestException('Failed to update subscription');
    }
  }

  async cancelSubscription(companyId: string): Promise<any> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Update subscription status
      const { error } = await supabase
        .from('companies')
        .update({
          subscription_status: 'canceled',
          plan: 'starter', // Downgrade to starter plan
        })
        .eq('id', companyId);

      if (error) {
        throw new BadRequestException('Failed to cancel subscription');
      }

      return {
        message: 'Subscription canceled successfully',
        status: 'canceled',
      };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  async getInvoices(companyId: string): Promise<Invoice[]> {
    try {
      // Mock invoices for demo
      const mockInvoices: Invoice[] = [
        {
          id: 'in_2024001',
          amount: 7900, // $79.00 in cents
          currency: 'usd',
          status: 'paid',
          created: new Date('2024-01-01'),
          hostedInvoiceUrl: 'https://invoice.stripe.com/mock-url',
        },
        {
          id: 'in_2023012',
          amount: 7900,
          currency: 'usd',
          status: 'paid',
          created: new Date('2023-12-01'),
          hostedInvoiceUrl: 'https://invoice.stripe.com/mock-url',
        },
        {
          id: 'in_2023011',
          amount: 2900, // $29.00 in cents
          currency: 'usd',
          status: 'paid',
          created: new Date('2023-11-01'),
          hostedInvoiceUrl: 'https://invoice.stripe.com/mock-url',
        },
      ];

      return mockInvoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw new BadRequestException('Failed to fetch invoices');
    }
  }

  async updatePaymentMethod(
    companyId: string,
    paymentMethodId: string,
  ): Promise<any> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Get company
      const { data: company } = await supabase
        .from('companies')
        .select('stripe_customer_id')
        .eq('id', companyId)
        .single();

      if (!company?.stripe_customer_id) {
        throw new NotFoundException('Customer not found');
      }

      // Mock payment method update
      return {
        message: 'Payment method updated successfully',
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'visa',
        },
      };
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw new BadRequestException('Failed to update payment method');
    }
  }

  async createPortalSession(companyId: string): Promise<{ url: string }> {
    try {
      const billingInfo = await this.getBillingInfo(companyId);

      // Mock portal URL for demo
      return {
        url: `https://billing.stripe.com/session/mock-session-${companyId}`,
      };
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new BadRequestException('Failed to create billing portal session');
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    try {
      // In a real implementation, verify the webhook signature
      // const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      console.log('Processing webhook:', payload.type);

      // Handle different webhook events
      switch (payload.type) {
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(payload.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(payload.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(payload.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(payload.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${payload.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async createCustomer(companyId: string): Promise<Stripe.Customer> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();

      // Mock customer creation for demo
      const mockCustomer = {
        id: `cus_${Date.now()}`,
        name: company?.name || 'Unknown Company',
        email: `billing-${companyId}@company.com`,
      } as Stripe.Customer;

      // Update company with customer ID
      await supabase
        .from('companies')
        .update({ stripe_customer_id: mockCustomer.id })
        .eq('id', companyId);

      return mockCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  private getPlanFromPriceId(priceId: string): string {
    const planMap: Record<string, string> = {
      'price_starter': 'starter',
      'price_professional': 'professional',
      'price_enterprise': 'enterprise',
    };
    return planMap[priceId] || 'starter';
  }

  private getPriceAmount(priceId: string): number {
    const priceMap: Record<string, number> = {
      'price_starter': 2900, // $29.00
      'price_professional': 7900, // $79.00
      'price_enterprise': 19900, // $199.00
    };
    return priceMap[priceId] || 2900;
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    // Update subscription status in database
    console.log('Subscription updated:', subscription.id);
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    // Handle subscription cancellation
    console.log('Subscription deleted:', subscription.id);
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    // Handle successful payment
    console.log('Payment succeeded for invoice:', invoice.id);
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    // Handle failed payment
    console.log('Payment failed for invoice:', invoice.id);
  }
}