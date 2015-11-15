-- events that need to be marked as done
UPDATE `event`
SET `status` = 2
WHERE start_time < NOW()
AND `status` < 2;

-- events that need to be locked
UPDATE `event`
SET `status` = 1
WHERE response_deadline < NOW()
AND `status` < 1;