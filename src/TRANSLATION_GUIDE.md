# Translation Implementation Guide

This project now supports multiple languages (English, Spanish, and Italian) using react-i18next.

## How to Use Translations in Components

### 1. Import the translation hook
```typescript
import { useTranslation } from 'react-i18next';
```

### 2. Use the hook in your component
```typescript
const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('menu.title')}</h1>
      <p>{t('menu.addToCart')}</p>
    </div>
  );
};
```

## Translation Keys Structure

All translations are organized in JSON files under `src/locales/{language}/translation.json`:
- `en` - English
- `es` - Spanish (Español)
- `it` - Italian (Italiano)

### Available Translation Keys

#### Common
- `common.search` - "Search"
- `common.cancel` - "Cancel"
- `common.save` - "Save"
- `common.delete` - "Delete"
- `common.edit` - "Edit"
- `common.add` - "Add"
- `common.close` - "Close"
- `common.back` - "Back"
- `common.loading` - "Loading..."

#### Menu
- `menu.title` - "Menu"
- `menu.all` - "All"
- `menu.featured` - "Featured Items"
- `menu.addToCart` - "Add to Cart"
- `menu.viewDetails` - "View Details"

#### Cart
- `cart.title` - "Shopping Cart"
- `cart.empty` - "Your cart is empty"
- `cart.subtotal` - "Subtotal"
- `cart.deliveryFee` - "Delivery Fee"
- `cart.total` - "Total"
- `cart.checkout` - "Proceed to Checkout"
- `cart.continueShopping` - "Continue Shopping"

#### Customer Area
- `customer.myAccount` - "My Account"
- `customer.myOrders` - "My Orders"
- `customer.editProfile` - "Edit Profile"
- `customer.logout` - "Logout"
- `customer.orders.title` - "My Orders"
- `customer.orders.noOrders` - "You haven't placed any orders yet"
- `customer.orders.viewDetails` - "View Details"
- `customer.orders.completePayment` - "Complete Payment"

#### Admin Area
- `admin.dashboard` - "Dashboard"
- `admin.orders` - "Orders"
- `admin.products` - "Products"
- `admin.categories` - "Categories"
- `admin.settings` - "Settings"
- `admin.logout` - "Logout"

## Language Selector

The language selector is available in:
- **Customer Header** - Top right corner
- **Admin Sidebar** - Top right corner of the sidebar

Users can switch between:
- 🇬🇧 English
- 🇪🇸 Español
- 🇮🇹 Italiano

The selected language is saved to localStorage and persists across sessions.

## Adding New Translations

To add new translation keys:

1. Add the key to all language files:
   - `src/locales/en/translation.json`
   - `src/locales/es/translation.json`
   - `src/locales/it/translation.json`

2. Use the key in your component:
```typescript
const { t } = useTranslation();
return <div>{t('your.new.key')}</div>;
```

## Example: Converting a Component

**Before:**
```typescript
const MyComponent = () => {
  return (
    <div>
      <h1>My Orders</h1>
      <button>View Details</button>
    </div>
  );
};
```

**After:**
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('customer.orders.title')}</h1>
      <button>{t('customer.orders.viewDetails')}</button>
    </div>
  );
};
```

## Components Already Translated

- ✅ Header (with language selector)
- ✅ AdminSidebar (with language selector)
- ✅ CustomerSidebar
- ✅ Cart page
- ✅ CustomerOrders page

## Components to Translate

The following components still need translation implementation:
- [ ] Index (Menu page)
- [ ] Checkout
- [ ] ProductDetail
- [ ] Login/Register pages
- [ ] Admin pages (AdminOrders, AdminProducts, AdminSettings, etc.)
- [ ] CustomerProfile
- [ ] CustomerAccount

Follow the pattern shown in the already-translated components to implement translations in remaining components.
