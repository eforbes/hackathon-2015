SELECT
	event_id,
	condition_id,
	`invitation`.status AS status,
	owner AS owner_id,
	title,
	description,
	location,
	start_time,
	response_deadline,
	minimum_attendance,
	`event`.`status` AS event_status,
	`owning_user`.name AS owner_name,
	`owning_user`.email AS owner_email,
	`owning_user`.image_url AS owner_image,
	(
		SELECT COUNT(*)
		FROM `invitation` `i`
		WHERE `i`.event_id = `invitation`.event_id
	) as number_invited,
	(
		SELECT COUNT(*)
		FROM `invitation` `i`
		WHERE `i`.event_id = `invitation`.event_id
		AND `i`.`status` = 1
	) as number_attending
FROM `invitation`
LEFT JOIN `event` ON event_id = `event`.id
LEFT JOIN `user` AS owning_user ON `owner` = owning_user.id
WHERE user_id = ? and hidden = 0;
