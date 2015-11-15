SELECT user_id, `status`, name, email, image_url, NOT (favoritee IS NULL) AS is_favorite
FROM `invitation`
LEFT JOIN `user` on user_id = id
LEFT JOIN favorite on favoriter = ? AND favoritee = user_id
WHERE event_id = ?;