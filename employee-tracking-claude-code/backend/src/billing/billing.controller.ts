import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  UseGuards, 
  Request, 
  Res,
  Headers,
  RawBodyRequest,
  Req
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  BillingService, 
  CreateSubscriptionDto, 
  UpdateSubscriptionDto 
} from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'administrator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get billing information' })
  @ApiResponse({ status: 200, description: 'Billing information retrieved successfully' })
  async getBillingInfo(@Request() req) {
    return this.billingService.getBillingInfo(req.user.companyId);
  }

  @Post('subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription data' })
  async createSubscription(
    @Body() createDto: CreateSubscriptionDto,
    @Request() req,
  ) {
    const subscription = await this.billingService.createSubscription(
      req.user.companyId,
      createDto,
    );

    return {
      message: 'Subscription created successfully',
      subscription,
    };
  }

  @Put('subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async updateSubscription(
    @Body() updateDto: UpdateSubscriptionDto,
    @Request() req,
  ) {
    const subscription = await this.billingService.updateSubscription(
      req.user.companyId,
      updateDto,
    );

    return {
      message: 'Subscription updated successfully',
      subscription,
    };
  }

  @Delete('subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async cancelSubscription(@Request() req) {
    return this.billingService.cancelSubscription(req.user.companyId);
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'administrator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get billing invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async getInvoices(@Request() req) {
    const invoices = await this.billingService.getInvoices(req.user.companyId);

    return {
      message: 'Invoices retrieved successfully',
      invoices,
    };
  }

  @Put('payment-method')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment method' })
  @ApiResponse({ status: 200, description: 'Payment method updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment method' })
  async updatePaymentMethod(
    @Body() body: { paymentMethodId: string },
    @Request() req,
  ) {
    return this.billingService.updatePaymentMethod(
      req.user.companyId,
      body.paymentMethodId,
    );
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create billing portal session' })
  @ApiResponse({ status: 200, description: 'Portal session created successfully' })
  async createPortalSession(@Request() req) {
    const session = await this.billingService.createPortalSession(req.user.companyId);

    return {
      message: 'Portal session created successfully',
      url: session.url,
    };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.billingService.handleWebhook(req.body, signature);

    return { received: true };
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getPlans() {
    // Return available subscription plans
    const plans = [
      {
        id: 'starter',
        name: 'Starter',
        priceId: 'price_starter',
        price: 29,
        currency: 'usd',
        interval: 'month',
        maxEmployees: 50,
        features: [
          'Up to 50 employees',
          'Basic analytics',
          'Email integration',
          'CSV import/export',
          'Standard support',
        ],
      },
      {
        id: 'professional',
        name: 'Professional',
        priceId: 'price_professional',
        price: 79,
        currency: 'usd',
        interval: 'month',
        maxEmployees: 500,
        features: [
          'Up to 500 employees',
          'Advanced analytics',
          'AI-powered insights',
          'Custom workflows',
          'Priority support',
          'API access',
        ],
        popular: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        priceId: 'price_enterprise',
        price: 199,
        currency: 'usd',
        interval: 'month',
        maxEmployees: -1, // unlimited
        features: [
          'Unlimited employees',
          'Custom integrations',
          'Advanced security',
          'Dedicated support',
          'On-premise deployment',
          'SLA guarantee',
        ],
      },
    ];

    return {
      message: 'Plans retrieved successfully',
      plans,
    };
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current usage statistics' })
  @ApiResponse({ status: 200, description: 'Usage statistics retrieved successfully' })
  async getUsage(@Request() req) {
    // Mock usage data
    const usage = {
      employees: {
        current: 127,
        limit: 500,
        percentage: 25.4,
      },
      storage: {
        current: 2.1, // GB
        limit: 50, // GB
        percentage: 4.2,
      },
      apiCalls: {
        current: 15420,
        limit: 100000,
        percentage: 15.4,
      },
      billingPeriod: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
        daysRemaining: 15,
      },
    };

    return {
      message: 'Usage statistics retrieved successfully',
      usage,
    };
  }
}