import Publication, { IPublication } from "../models/publication";
import { PublicationStatus } from "../types/domain";
import { escapeRegex } from "../utils/escapeRegex";

export interface PublicationSearch {
    text: string;
    matchingUserIds: string[];
}

class PublicationRepository {
    async create(publicationData: Partial<IPublication>): Promise<IPublication> {
        const publication = new Publication(publicationData);
        return await publication.save();
    }

    async findById(id: string): Promise<IPublication | null> {
        return await Publication.findById(id).select("-__v");
    }

    // Igual que findById, pero con el autor poblado (solo para mostrar en pantalla).
    // No usar en lógica de propiedad: ahí user_id debe seguir siendo el ObjectId plano.
    async findByIdWithAuthor(id: string): Promise<IPublication | null> {
        return await Publication.findById(id).select("-__v").populate("user_id", "name nick image");
    }

    // Con el autor poblado: igual que findByStatus, solo para mostrar en pantalla.
    async findByUserId(userId: string, options: any): Promise<{ docs: IPublication[], totalDocs: number, totalPages: number, page: number, limit: number }> {
        return await (Publication as any).paginate(
            { user_id: userId },
            { ...options, populate: { path: "user_id", select: "name nick image" } }
        );
    }

    // Para que el beneficiario pueda ver las reservas de SUS publicaciones.
    async findIdsByOwner(userId: string): Promise<string[]> {
        const publications = await (Publication as any).find({ user_id: userId }).select("_id");
        return publications.map((p: any) => p._id.toString());
    }

    // Para "Guardados": trae un conjunto de publicaciones por id, con autor
    // poblado (solo para mostrar en pantalla, igual que findByIdWithAuthor).
    async findByIds(ids: string[]): Promise<IPublication[]> {
        return await (Publication as any)
            .find({ _id: { $in: ids } })
            .select("-__v")
            .populate("user_id", "name nick image");
    }

    // Con el autor poblado: esta lista es solo para mostrar en pantalla, no para
    // lógica de propiedad (eso sigue usando findById, con user_id sin poblar).
    // "search" (opcional, para la barra de búsqueda del navbar) filtra por texto
    // de la historia, nombre de la necesidad, o nombre del beneficiario.
    async findByStatus(
        status: PublicationStatus,
        options: any,
        search?: PublicationSearch
    ): Promise<{ docs: IPublication[], totalDocs: number, totalPages: number, page: number, limit: number }> {
        const filter: Record<string, unknown> = { status };

        if (search) {
            const regex = { $regex: escapeRegex(search.text), $options: "i" };
            filter.$or = [
                { text: regex },
                { "necesidades.name": regex },
                { user_id: { $in: search.matchingUserIds } }
            ];
        }

        return await (Publication as any).paginate(
            filter,
            { ...options, populate: { path: "user_id", select: "name nick image" } }
        );
    }

    async update(id: string, updateData: Partial<IPublication>): Promise<IPublication | null> {
        return await Publication.findByIdAndUpdate(id, updateData, { new: true }).select("-__v");
    }

    async delete(id: string, userId: string): Promise<IPublication | null> {
        return await (Publication as any).findOneAndDelete({ _id: id, user_id: userId });
    }

    async updateStatus(id: string, status: string): Promise<IPublication | null> {
        return await Publication.findByIdAndUpdate(id, { status }, { new: true }).select("-__v");
    }

    async updateImage(id: string, userId: string, filename: string): Promise<IPublication | null> {
        return await (Publication as any).findOneAndUpdate(
            { _id: id, user_id: userId },
            { file: filename },
            { new: true }
        ).select("-__v");
    }

    async atomicReserveItem(publicationId: string, itemId: string): Promise<IPublication | null> {
        return await Publication.findOneAndUpdate(
            {
                _id: publicationId,
                status: "aprobada",
                necesidades: { $elemMatch: { _id: itemId, status: "disponible" } }
            },
            {
                $set: { "necesidades.$.status": "reservado" }
            },
            { new: true }
        ).select("-__v");
    }

    async updateItemStatus(publicationId: string, itemId: string, status: string): Promise<IPublication | null> {
        return await Publication.findOneAndUpdate(
            { _id: publicationId, "necesidades._id": itemId },
            { $set: { "necesidades.$.status": status } },
            { new: true }
        ).select("-__v");
    }
}

export default new PublicationRepository();
