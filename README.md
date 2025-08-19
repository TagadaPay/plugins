# TagadaPay Plugin Funnel Examples

This repository provides examples of how to create custom funnel pages with integrated checkout using the [TagadaPay](https://tagadapay.com) SDK.

## Overview

Each subfolder in this repository contains a standalone example of a funnel page, demonstrating different approaches to building checkout experiences with TagadaPay. These examples are intended to help developers quickly get started with building and deploying their own custom payment funnels.

- **advertorial/**: Example of an advertorial-style funnel with checkout
- **three-step-funnel/**: Example of a three-step funnel with checkout
- **three-variants/**: Example showing three different variants with checkout

## Getting Started

To build your own funnel or checkout page, you can use the [@tagadapay/plugin-sdk](https://www.npmjs.com/package/@tagadapay/plugin-sdk) package. This SDK provides all the tools you need to integrate TagadaPay into your custom frontend.

To deploy your plugin, use the [@tagadapay/plugin-cli](https://www.npmjs.com/package/@tagadapay/plugin-cli), which makes it easy to package and publish your funnel plugins.

## Useful Links

- [@tagadapay/plugin-sdk on npm](https://www.npmjs.com/package/@tagadapay/plugin-sdk)
- [@tagadapay/plugin-cli on npm](https://www.npmjs.com/package/@tagadapay/plugin-cli)

## Live Whitelabel Examples

You can try out the live whitelabel version of the available funnel examples below:

- **Three Variants:** [https://three-step-variants-01-3ws21b.cdn.tagadapay.com/checkout](https://three-step-variants-01-3ws21b.cdn.tagadapay.com/checkout)

_More examples will be added soon as they become available._

### Test Payment Instructions

To proceed with a payment in the whitelabel examples, use the following test credit card details:

```plaintext
┌───────────────────────────────┐
│  Test Credit card             │
│                               │
│  Number: 4242 4242 4242 4242  │
│  Exp:   12/29 (future date)   │
│  CVC:   333 (any 3 digits)    │
└───────────────────────────────┘
```

Simply enter these details at checkout to simulate a successful payment.

## License

MIT
