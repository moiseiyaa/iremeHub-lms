-- iremehub+ Phase 2: relational domain foundation (PostgreSQL 15+)
-- PROPOSED MIGRATION. Not executed against any database.
-- Tenant isolation requires application authorization and further RLS review.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE platform_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  password_hash TEXT,
  display_name TEXT NOT NULL,
  account_status TEXT NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'suspended', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX platform_users_email_ci_idx ON platform_users (lower(email));

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (length(slug) BETWEEN 3 AND 64),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'trial'
    CHECK (status IN ('trial', 'active', 'suspended', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE organization_memberships (
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'educator', 'learner')),
  status TEXT NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'active', 'suspended')),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);
CREATE INDEX memberships_user_idx ON organization_memberships (user_id, status);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  creator_user_id UUID NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'draft'
    CHECK (visibility IN ('draft', 'published', 'archived')),
  price_minor BIGINT NOT NULL DEFAULT 0 CHECK (price_minor >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'RWF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, slug),
  FOREIGN KEY (organization_id, creator_user_id)
    REFERENCES organization_memberships(organization_id, user_id)
);
CREATE INDEX courses_org_visibility_idx ON courses(organization_id, visibility);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  course_id UUID NOT NULL,
  learner_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'cancelled', 'completed')),
  enrolled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, course_id, learner_user_id),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, course_id)
    REFERENCES courses(organization_id, id),
  FOREIGN KEY (organization_id, learner_user_id)
    REFERENCES organization_memberships(organization_id, user_id)
);
CREATE INDEX enrollments_learner_idx ON enrollments (organization_id, learner_user_id, status);

CREATE TABLE course_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  course_id UUID NOT NULL,
  learner_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'revoked', 'expired')),
  source_kind TEXT NOT NULL CHECK (source_kind IN ('free', 'purchase', 'subscription', 'admin_grant')),
  source_reference TEXT,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, course_id, learner_user_id),
  FOREIGN KEY (organization_id, course_id, learner_user_id)
    REFERENCES enrollments(organization_id, course_id, learner_user_id)
);
CREATE INDEX entitlements_active_idx ON course_entitlements (organization_id, learner_user_id, status);

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_minor BIGINT NOT NULL CHECK (price_minor >= 0),
  currency CHAR(3) NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('month', 'year')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  provider TEXT,
  provider_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'trialing'
    CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, id),
  UNIQUE (provider, provider_subscription_id),
  CHECK (current_period_end IS NULL OR current_period_start IS NULL
    OR current_period_end > current_period_start)
);
CREATE INDEX subscriptions_org_status_idx ON organization_subscriptions (organization_id, status);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  learner_user_id UUID REFERENCES platform_users(id),
  course_id UUID,
  amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
  currency CHAR(3) NOT NULL,
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, id),
  UNIQUE (provider, provider_payment_id),
  FOREIGN KEY (organization_id, course_id) REFERENCES courses(organization_id, id)
);

CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  payment_id UUID,
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  payload_sha256 TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processed', 'failed')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  UNIQUE (provider, provider_event_id),
  FOREIGN KEY (organization_id, payment_id) REFERENCES payments(organization_id, id)
);
CREATE INDEX payment_events_pending_idx ON payment_events(processing_status, received_at);

COMMIT;
