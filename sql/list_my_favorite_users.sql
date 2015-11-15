SELECT id, name, email, image_url 
FROM favorite
LEFT JOIN `user` on favoritee = id
WHERE favoriter = ?;