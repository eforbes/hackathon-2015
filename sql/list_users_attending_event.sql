SELECT user_id, `status`, name, email, image_url
FROM `invitation`
LEFT JOIN `user` on user_id = id
WHERE event_id = ?;