# Plan: Wix Business API Integration Opportunities

Based on your current implementation using only **Products** and **Collections** APIs, here's what additional Wix Business API functionality can enhance your antiques e-commerce site.

## Current State
- ✅ Products API (query, single product fetch)
- ✅ Collections API (category mapping)
- ✅ Webhook listener (triggers rebuilds on product changes)
- ✅ Inventory Management (stock levels, availability)
- ✅ Wix Cart Integration (persistent cart with fallback)
- ✅ Wix Checkout & Orders (hosted checkout, order management)
- ❌ Read-only product integration complete
- ✅ Cart and checkout fully integrated with Wix ecom

---

## Available Wix API Integrations

### Priority 1: Core E-Commerce (High Impact)

#### 1. Inventory Management
**API**: `@wix/stores` - Inventory module
- **Stock levels**: Display real-time availability
- **Track quantity**: Show "Only 1 left!" messaging
- **Inventory status**: Handle out-of-stock products
- **Multi-location inventory**: If you have multiple warehouses

**Benefits**: Prevents overselling, accurate stock display, better customer experience

---

#### 2. Product Variants & Options
**API**: `@wix/stores` - Product Options
- **Variants**: Size, condition (mint/good/fair), color, material
- **Pricing per variant**: Different prices for different conditions
- **Images per variant**: Show condition-specific photos
- **SKU per variant**: Better inventory tracking

**Benefits**: Essential for antiques with multiple conditions or variations

---

#### 3. Wix Cart Integration
**API**: `@wix/ecom` - Cart module
- **Persistent cart**: Cart survives page refreshes, cross-device
- **Cart validation**: Automatically checks stock before checkout
- **Applied discounts**: Coupon handling at cart level
- **Tax calculation**: Wix handles tax based on location

**Benefits**: Professional cart experience, eliminates local state management issues

---

#### 4. Wix Checkout & Orders
**API**: `@wix/ecom` - Checkout & Orders modules
- **Full checkout flow**: Replace Stripe-only checkout
- **Order creation in Wix**: Orders appear in Wix dashboard
- **Order tracking**: Customers can track orders
- **Shipping integration**: Connect with shipping providers
- **Payment methods**: Multiple payment gateways (not just Stripe)
- **Order history**: Customer order management

**Benefits**: Unified order management, better fulfillment workflow, customer self-service

---

### Priority 2: Customer Experience (Medium Impact)

#### 5. Members & Authentication
**API**: `@wix/members` - Member authentication
- **Customer accounts**: Login/register functionality
- **Visitor sessions**: Track anonymous users
- **Member profiles**: Saved addresses, preferences
- **Wishlist**: Save favorite items
- **Order history**: View past purchases

**Benefits**: Personalization, repeat customer experience, customer retention

---

#### 6. Reviews & Ratings
**API**: `@wix/reviews` - Product reviews
- **Customer reviews**: Product ratings and comments
- **Review moderation**: Approve/reject reviews
- **Star ratings**: Display average ratings
- **Review photos**: Customers upload condition photos

**Benefits**: Social proof, builds trust for vintage/antique items

---

#### 7. Coupons & Discounts
**API**: `@wix/marketing` - Coupons module
- **Discount codes**: Percentage or fixed amount off
- **Promotion rules**: Min purchase, specific categories
- **Bulk discounts**: Buy 3 get 10% off
- **Limited-time offers**: Flash sales

**Benefits**: Marketing campaigns, customer acquisition, clearance sales

---

### Priority 3: Business Operations (Lower Priority)

#### 8. Product Recommendations
**API**: `@wix/stores` - Recommendations
- **Related products**: "Customers also viewed"
- **Cross-sell**: Complementary items
- **Recently viewed**: Track browsing history

**Benefits**: Increased average order value

---

#### 9. Analytics & Insights
**API**: `@wix/analytics` - Site analytics
- **Product views**: Track popular items
- **Conversion tracking**: Cart abandonment rates
- **Traffic sources**: Where customers come from
- **Revenue reports**: Sales performance

**Benefits**: Data-driven decisions, optimize inventory

---

#### 10. Customer Contacts (CRM)
**API**: `@wix/crm` - Contacts module
- **Contact sync**: Store customer info
- **Email lists**: Newsletter subscriptions
- **Customer segmentation**: Target marketing
- **Purchase history**: Track customer lifetime value

**Benefits**: Email marketing, customer relationship management

---

#### 11. Bookings (Optional)
**API**: `@wix/bookings` - Appointments
- **Virtual consultations**: Appraisal appointments
- **In-person viewings**: Schedule showroom visits
- **Restoration services**: Book repair/restoration

**Benefits**: Premium service offering for high-value antiques

---

#### 12. Blog Content
**API**: `@wix/blog` - Blog posts
- **Content marketing**: Antique guides, history articles
- **SEO content**: Drive organic traffic
- **Product stories**: Provenance and background

**Benefits**: Content marketing, establish expertise, SEO

---

## Implementation Considerations

### Architecture Shift Required
Your current **static site** approach (prerendering + webhook rebuilds) works for product catalog but conflicts with dynamic features like:
- Real-time cart
- Live inventory
- Member sessions
- Order processing

**Options**:
1. **Hybrid approach**: Static product pages + dynamic cart/checkout (recommended)
2. **Full SSR**: Server-side rendering for all dynamic features
3. **API routes**: Keep static frontend, add serverless API routes for Wix interactions

### Authentication Strategy
Current OAuth with client ID only works for public data. For member features you'll need:
- **Visitor authentication**: Track anonymous users
- **Member tokens**: JWT for logged-in users
- **Token refresh**: Handle session expiration

### Environment Variables Needed
Additional configuration beyond current `VITE_WIX_CLIENT_ID`:
- `WIX_CLIENT_SECRET` (for OAuth refresh tokens)
- `WIX_ACCOUNT_ID` (for some business APIs)
- `WIX_SITE_ID` (for site-specific features)

---

## Recommended Roadmap

**Phase 1** (✅ COMPLETED):
1. ✅ Inventory API - show stock levels
2. ⏭️ Product variants - handle condition variations (SKIPPED)
3. ⏭️ Enhanced product data - dimensions, weight, materials (SKIPPED)

**Phase 2** (✅ COMPLETED):
4. ✅ Wix Cart integration
5. ✅ Wix Checkout flow
6. ✅ Order creation in Wix
7. ✅ Order confirmation page
8. ✅ Order history view

**Phase 3** (🔄 IN PROGRESS):
9. ⏸️ Member authentication (PENDING - requires backend)
10. ⏸️ Customer profiles (PENDING)
11. ⏸️ Order history (FOUNDATION COMPLETE - needs auth)
12. ⏸️ Reviews & ratings (PENDING)

**Phase 4** (📋 PLANNED):
13. Coupons & discounts
14. Product recommendations
15. Analytics integration
16. Blog content

---

## Next Steps

Would you like me to create a detailed implementation plan for any specific priority tier, or would you prefer to start with Phase 1 (Inventory + Variants)?
