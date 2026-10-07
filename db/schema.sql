CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role          text NOT NULL CHECK (role IN ('rider','driver')),
  name          text NOT NULL,
  email         text NOT NULL UNIQUE,
  phone         text,
  password_hash text NOT NULL,
  rating        numeric(3,2) NOT NULL DEFAULT 5.00,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE drivers (
  user_id   uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  car_model text NOT NULL,
  plate     text NOT NULL,
  car_class text NOT NULL DEFAULT 'economy' CHECK (car_class IN ('economy','comfort','xl')),
  status    text NOT NULL DEFAULT 'offline' CHECK (status IN ('offline','online','on_trip'))
);

CREATE TABLE trips (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id      uuid NOT NULL REFERENCES users(id),
  driver_id     uuid REFERENCES users(id),
  status        text NOT NULL DEFAULT 'requested'
                CHECK (status IN ('requested','accepted','arrived','in_progress','completed','cancelled')),
  ride_class    text NOT NULL CHECK (ride_class IN ('economy','comfort','xl')),
  pickup_lat    double precision NOT NULL,
  pickup_lng    double precision NOT NULL,
  pickup_addr   text,
  drop_lat      double precision NOT NULL,
  drop_lng      double precision NOT NULL,
  drop_addr     text,
  distance_km   numeric(8,2) NOT NULL,
  duration_min  numeric(8,2) NOT NULL,
  fare_estimate numeric(10,2) NOT NULL,
  fare_final    numeric(10,2),
  pin           char(4) NOT NULL,
  route         jsonb,
  rating        smallint CHECK (rating BETWEEN 1 AND 5),
  tip           numeric(6,2) NOT NULL DEFAULT 0,
  cancel_reason text,
  requested_at  timestamptz NOT NULL DEFAULT now(),
  accepted_at   timestamptz,
  arrived_at    timestamptz,
  started_at    timestamptz,
  completed_at  timestamptz,
  cancelled_at  timestamptz
);
CREATE INDEX ON trips (rider_id, requested_at DESC);
CREATE INDEX ON trips (driver_id, requested_at DESC);
CREATE INDEX ON trips (status);

CREATE TABLE trip_events (
  id         bigserial PRIMARY KEY,
  trip_id    uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  event      text NOT NULL,
  payload    jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id      uuid NOT NULL UNIQUE REFERENCES trips(id),
  amount       numeric(10,2) NOT NULL,
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  provider     text,
  provider_ref text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
