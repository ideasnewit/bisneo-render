export default function itemExists(response, id) {
    if (response && id) {
        return response.id !== id;
    }
    return response !== null;
}
