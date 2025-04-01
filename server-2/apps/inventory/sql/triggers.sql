-- -- ==================================================
-- -- SQL FUNCTION TO GENERATE INVENTORY ID (INVMMYYXXXX)
-- -- ==================================================
-- CREATE OR REPLACE FUNCTION generate_inventory_id()
-- RETURNS TRIGGER AS $$
-- DECLARE 
--     new_inv_id TEXT;
--     random_number TEXT;
--     current_month TEXT;
--     current_year TEXT;
-- BEGIN
--     -- Get current month and last 2 digits of the year
--     SELECT TO_CHAR(NOW(), 'MM') INTO current_month;
--     SELECT TO_CHAR(NOW(), 'YY') INTO current_year;
    
--     -- Generate a random 4-digit number
--     SELECT LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') INTO random_number;

--     -- Generate the inventory ID: "INVMMYYXXXX"
--     new_inv_id := 'INV' || current_month || current_year || random_number;

--     -- Assign new inventory ID
--     NEW.inv_id := new_inv_id;

--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- ==================================================
-- -- TRIGGER FOR AUTOMATIC INVENTORY ID ON INSERT
-- -- ==================================================
-- CREATE TRIGGER trigger_inventory_insert
-- BEFORE INSERT ON inventory
-- FOR EACH ROW
-- EXECUTE FUNCTION generate_inventory_id();


-- -- ==================================================
-- -- SQL FUNCTION TO GENERATE MEDICINE INVENTORY ID (MEDMMYYXXXX)
-- -- ==================================================
-- CREATE OR REPLACE FUNCTION generate_medicine_inventory_id()
-- RETURNS TRIGGER AS $$
-- DECLARE 
--     new_med_id TEXT;
--     random_number TEXT;
--     current_month TEXT;
--     current_year TEXT;
-- BEGIN
--     -- Get current month and last 2 digits of the year
--     SELECT TO_CHAR(NOW(), 'MM') INTO current_month;
--     SELECT TO_CHAR(NOW(), 'YY') INTO current_year;
    
--     -- Generate a random 4-digit number
--     SELECT LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') INTO random_number;

--     -- Generate the medicine inventory ID: "MEDMMYYXXXX"
--     new_med_id := 'MED' || current_month || current_year || random_number;
    
--     -- Assign new medicine inventory ID
--     NEW.minv_id := new_med_id;

--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- ==================================================
-- -- TRIGGER FOR AUTOMATIC MEDICINE INVENTORY ID ON INSERT
-- -- ==================================================
-- CREATE TRIGGER trigger_medicine_inventory_insert
-- BEFORE INSERT ON medicine_inventory
-- FOR EACH ROW
-- EXECUTE FUNCTION generate_medicine_inventory_id();
