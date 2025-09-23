-- Crear función para cancelar órdenes pendientes después de 24 horas
CREATE OR REPLACE FUNCTION auto_cancel_old_orders()
RETURNS void AS $$
BEGIN
    UPDATE "Order" 
    SET status = 'cancelled',
        "updatedAt" = NOW()
    WHERE status = 'pending' 
    AND "createdAt" < NOW() - INTERVAL '24 hours'
    AND id IN (
        SELECT id FROM "Order" 
        WHERE status = 'pending' 
        AND "createdAt" < NOW() - INTERVAL '24 hours'
        FOR UPDATE SKIP LOCKED
    );
END;
$$ LANGUAGE plpgsql;

-- Crear función que será llamada por el trigger para enviar emails
CREATE OR REPLACE FUNCTION notify_auto_cancelled_orders()
RETURNS TRIGGER AS $$
DECLARE
    cancelled_orders RECORD;
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status = 'pending' THEN
        -- Aquí llamaríamos al servicio de email, pero en PostgreSQL no podemos hacer HTTP requests directamente
        -- En su lugar, insertaremos en una tabla de notificaciones para que un worker las procese
        INSERT INTO "AutoCancelNotification" (order_id, customer_email, order_data, created_at)
        VALUES (NEW.id, NEW."customerEmail", row_to_json(NEW), NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear tabla para notificaciones pendientes
CREATE TABLE IF NOT EXISTS "AutoCancelNotification" (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
    customer_email VARCHAR(255) NOT NULL,
    order_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Crear el trigger
DROP TRIGGER IF EXISTS auto_cancel_notification_trigger ON "Order";
CREATE TRIGGER auto_cancel_notification_trigger
    AFTER UPDATE ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION notify_auto_cancelled_orders();