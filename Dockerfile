# ============================================================
# Stage 1: deps — install production node_modules only
# ============================================================
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ============================================================
# Stage 2: builder — build the Next.js standalone output
# NEXT_PUBLIC_* vars must be passed as build args so they are
# inlined at build time (Next.js bakes them into the bundle).
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Receive all NEXT_PUBLIC_* URLs as build args
ARG NEXT_PUBLIC_API_GATEWAY_URL
ARG NEXT_PUBLIC_BILLING_URL
ARG NEXT_PUBLIC_INVENTORY_URL
ARG NEXT_PUBLIC_CRM_URL
ARG NEXT_PUBLIC_HRM_URL
ARG NEXT_PUBLIC_POS_URL
ARG NEXT_PUBLIC_PROJECTS_URL
ARG NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

# Expose them as env vars so Next.js picks them up during build
ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL
ENV NEXT_PUBLIC_BILLING_URL=$NEXT_PUBLIC_BILLING_URL
ENV NEXT_PUBLIC_INVENTORY_URL=$NEXT_PUBLIC_INVENTORY_URL
ENV NEXT_PUBLIC_CRM_URL=$NEXT_PUBLIC_CRM_URL
ENV NEXT_PUBLIC_HRM_URL=$NEXT_PUBLIC_HRM_URL
ENV NEXT_PUBLIC_POS_URL=$NEXT_PUBLIC_POS_URL
ENV NEXT_PUBLIC_PROJECTS_URL=$NEXT_PUBLIC_PROJECTS_URL
ENV NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=$NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ============================================================
# Stage 3: runner — minimal production image
# ============================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
