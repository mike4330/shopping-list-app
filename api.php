<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$dataFile = 'list.json';

function readList() {
    global $dataFile;
    if (!file_exists($dataFile)) {
        return [];
    }
    $content = file_get_contents($dataFile);
    return json_decode($content, true) ?: [];
}

function writeList($items) {
    global $dataFile;
    file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        echo json_encode(readList());
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $items = readList();

        if (isset($input['action'])) {
            if ($input['action'] === 'add') {
                $newItem = [
                    'id' => (int)(microtime(true) * 1000) + mt_rand(1, 999),
                    'text' => htmlspecialchars($input['text'], ENT_QUOTES, 'UTF-8'),
                    'completed' => false,
                    'addedBy' => isset($input['addedBy']) ? htmlspecialchars($input['addedBy'], ENT_QUOTES, 'UTF-8') : 'Unknown',
                    'addedAt' => time()
                ];
                $items[] = $newItem;
            } elseif ($input['action'] === 'toggle') {
                foreach ($items as &$item) {
                    if ($item['id'] === $input['id']) {
                        $item['completed'] = !$item['completed'];
                        break;
                    }
                }
            } elseif ($input['action'] === 'clear_all') {
                $items = [];
            }
        }

        writeList($items);
        echo json_encode($items);
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        $items = readList();

        $items = array_filter($items, function($item) use ($input) {
            return $item['id'] !== $input['id'];
        });

        writeList(array_values($items));
        echo json_encode(array_values($items));
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>