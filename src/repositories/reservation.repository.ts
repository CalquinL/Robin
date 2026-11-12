import Reservation, { IReservation } from "../models/reservation";
import { ReservationStatus } from "../types/domain";

// Para mostrar en pantalla: trae el donante y, dentro de la publicación, el
// beneficiario (user_id poblado) y las necesidades (para sacar el nombre del
// ítem reservado). No usar en lógica de negocio: ahí donor_id/publication_id
// deben seguir siendo ObjectId plano (ver ReservationService).
const DISPLAY_POPULATE = [
    { path: "donor_id", select: "name nick image" },
    {
        path: "publication_id",
        select: "text necesidades user_id",
        populate: { path: "user_id", select: "name nick image" }
    }
];

class ReservationRepository {
    async create(reservationData: Partial<IReservation>): Promise<IReservation> {
        const reservation = new Reservation(reservationData);
        return await reservation.save();
    }

    async findById(id: string): Promise<IReservation | null> {
        return await Reservation.findById(id);
    }

    async findByIdWithDetails(id: string): Promise<IReservation | null> {
        return await Reservation.findById(id).populate(DISPLAY_POPULATE as any);
    }

    async findByDonor(
        donorId: string,
        options: any,
        status?: ReservationStatus
    ): Promise<{ docs: IReservation[], totalDocs: number, totalPages: number, page: number, limit: number }> {
        const filter: Record<string, unknown> = { donor_id: donorId };
        if (status) filter.status = status;
        return await (Reservation as any).paginate(filter, { ...options, populate: DISPLAY_POPULATE });
    }

    // Para la vista del beneficiario: reservas de SUS publicaciones (no tiene donor_id propio).
    async findByPublicationIds(
        publicationIds: string[],
        options: any,
        status?: ReservationStatus
    ): Promise<{ docs: IReservation[], totalDocs: number, totalPages: number, page: number, limit: number }> {
        const filter: Record<string, unknown> = { publication_id: { $in: publicationIds } };
        if (status) filter.status = status;
        return await (Reservation as any).paginate(filter, { ...options, populate: DISPLAY_POPULATE });
    }

    // Para impedir que se borre una publicación con reservas en curso (sección 8 de CLAUDE.md).
    async hasActiveReservations(publicationId: string): Promise<boolean> {
        const existing = await (Reservation as any).exists({ publication_id: publicationId, status: "reservado" });
        return existing !== null;
    }

    async update(id: string, updateData: Partial<IReservation>): Promise<IReservation | null> {
        return await Reservation.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id: string): Promise<IReservation | null> {
        return await Reservation.findByIdAndDelete(id);
    }
}

export default new ReservationRepository();
