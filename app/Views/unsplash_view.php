<!-- app/Views/unsplash_view.php -->
<!DOCTYPE html>
<html>
<head>
    <title>Unsplash Photos</title>
</head>
<body>
    <h1>Unsplash Photos</h1>
    <ul>
        <?php foreach ($photos as $photo): ?>
            <li>
                <img src="<?= $photo['urls']['regular']; ?>" alt="<?= $photo['description']; ?>">
                <p>Photographer: <?= $photo['user']['name']; ?></p>
            </li>
        <?php endforeach; ?>
    </ul>
</body>
</html>
