// user_id viene como ObjectId plano salvo que el repositorio lo haya poblado
// (findByIdWithAuthor / findByStatus / findByIds) explícitamente para mostrar en pantalla.
export function serializePublication(publication: any) {
    const userRef = publication.user_id;
    const isPopulated = userRef && typeof userRef === "object" && "name" in userRef;

    return {
        _id: publication._id,
        user_id: isPopulated ? userRef._id : userRef,
        author: isPopulated
            ? { name: userRef.name, nick: userRef.nick, image: userRef.image }
            : undefined,
        text: publication.text,
        file: publication.file,
        status: publication.status,
        created_at: publication.created_at,
        necesidades: publication.necesidades.map((n: any) => ({
            _id: n._id,
            name: n.name,
            status: n.status
        }))
    };
}
