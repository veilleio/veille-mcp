// Generated from the Veille OpenAPI document. Do not edit by hand.

import type { EndpointEntry } from "./types.js";

export const MODE: "catalog" | "tools" = "tools";

export const CATALOG: readonly EndpointEntry[] = [
  {
    name: "intelligence_domain",
    title: "Domain Validation",
    path: "/v1/intelligence/domain",
    methods: ["GET"],
    description:
      "Domain Validation. Check any domain instantly. Detects disposable email providers, public webmail, relay services, and education domains. Returns DNS health with MX provider detection, domain history, and optional SSL/TLS certificate transparency. Credit cost: 2 credits per call.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description:
          "The domain to validate. Accepts raw domains (tempmail.org), full URLs (https://www.tempmail.org/page), or domains with www. prefix, all are normalized automatically.",
      },
      {
        name: "certificate_transparency",
        type: "boolean",
        required: false,
        description:
          "Enable Certificate Transparency lookup. Returns SSL/TLS certificate history, current certificate, issuers, and all Subject Alternative Names (SANs) ever associated with the domain. Adds 1-5 seconds of latency.",
        default: false,
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
    ],
  },
  {
    name: "intelligence_email",
    title: "Email Validation",
    path: "/v1/intelligence/email",
    methods: ["GET"],
    description:
      "Email Validation. Validate any email address in a single call. Detects disposable and temporary inboxes, identifies role accounts, public webmail, relay services, and returns a 0-100 risk score. For deep deliverability verification (SMTP check, catch-all de… Credit cost: 3 credits per call.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description:
          "The email address to validate (e.g. john@example.com). Automatically normalized to lowercase.",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
    ],
  },
  {
    name: "intelligence_emailq",
    title: "Email Qualification",
    path: "/v1/intelligence/emailq",
    methods: ["GET"],
    description:
      "Email Qualification. Deep email deliverability verification. Performs full Email Validation plus SMTP inbox check, catch-all detection, and returns a qualification verdict (valid, invalid, risky, disposable, unknown). Credit cost: 5 credits per call.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description:
          "The email address to qualify (e.g. john@example.com). Automatically normalized to lowercase.",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
    ],
  },
  {
    name: "intelligence_ip",
    title: "IP Reputation",
    path: "/v1/intelligence/ip",
    methods: ["GET"],
    description:
      "IP Reputation. Assess the reputation of any IP address. Detects VPNs, proxies, Tor exit nodes, datacenter hosting, abusive traffic, and bots. Returns geolocation, network owner, and a 0-100 threat score. Credit cost: 2 credits per call.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "The IP address to analyze (IPv4 or IPv6).",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
    ],
  },
  {
    name: "intelligence_phone",
    title: "Phone Validation",
    path: "/v1/intelligence/phone",
    methods: ["GET"],
    description:
      "Phone Validation. Validate any phone number in E.164 format. Detects disposable and virtual numbers, identifies carrier and line type (mobile/fixed/VoIP), returns country and timezone, and computes a 0-100 risk score. Credit cost: 1 credit per call.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description:
          "The phone number to validate in E.164 format (must start with +, e.g. +33612345678).",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
    ],
  },
  {
    name: "stats",
    title: "Stats",
    path: "/v1/stats",
    methods: ["GET"],
    description:
      "Stats. Infrastructure health for an engine or endpoint over the last hour. Not scoped to your account or tenant. Enabled per account: HTTP 403 means contact support to activate it.",
    params: [
      {
        name: "engine",
        type: "string",
        required: false,
        description:
          "API family to check, for example vat. Provide at least engine or path.",
      },
      {
        name: "path",
        type: "string",
        required: false,
        description:
          "Specific endpoint to check, for example /v1/vat. If you also pass engine, use an endpoint from that API.",
      },
    ],
  },
  {
    name: "usage",
    title: "Usage",
    path: "/v1/usage",
    methods: ["GET"],
    description:
      "Usage. Retrieve real-time usage statistics and credit balance for your Veille account.",
    params: [],
  },
  {
    name: "vat",
    title: "VAT Validation",
    path: "/v1/vat",
    methods: ["GET"],
    description:
      "VAT Validation. Validate a European VAT number against the VIES database. Returns company name, registered address, and validity status for any EU member state. Credit cost: 1 credit per call.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "The VAT number to validate (e.g. FR40303265045).",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
    ],
  },
  {
    name: "vat_iban",
    title: "IBAN Validation",
    path: "/v1/vat/iban",
    methods: ["GET"],
    description:
      "IBAN Validation. Validate any IBAN and retrieve associated bank details. Returns the BIC/SWIFT code, bank name, country, BBAN structural breakdown, and SEPA zone membership. Credit cost: 1 credit per call.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "The IBAN to validate (e.g. FR7630006000011234567890189).",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
    ],
  },
  {
    name: "vat_rates",
    title: "Exchange Rates",
    path: "/v1/vat/rates",
    methods: ["GET"],
    description:
      "Exchange Rates. Get current ECB exchange rates for any supported base currency. Optionally filter to specific target currencies. Updated daily from the European Central Bank. Credit cost: 1 credit per call.",
    params: [
      {
        name: "base",
        type: "string",
        required: false,
        description: "Base currency ISO 4217 code (defaults to EUR).",
        default: "EUR",
      },
      {
        name: "symbols",
        type: "string",
        required: false,
        description:
          "Comma-separated target currency codes to filter (e.g. USD,GBP,JPY).",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
    ],
  },
];
