-- events that need to be locked
SELECT *
FROM `event`
WHERE response_deadline < NOW()
AND `status` <= 0;

-- events that need to be marked as done
SELECT *
FROM `event`
WHERE start_time < NOW()
AND `status` <= 1;