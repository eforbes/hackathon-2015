INSERT INTO `invitation` (user_id, event_id) VALUES ((
	SELECT id FROM `user` where email = ?
), ?);