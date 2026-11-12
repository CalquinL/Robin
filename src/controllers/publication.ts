import { Request, Response, NextFunction } from "express";
import publicationService from "../services/publication.service";
import { sendSuccess } from "../utils/response";
import AppError from "../utils/AppError";
import { PUBLICATION_STATUS, PublicationStatus } from "../types/domain";
import { serializePublication } from "../utils/serializePublication";

class PublicationController {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Usuario no autenticado");

            const { text, necesidades } = req.body;
            if (!text || !necesidades || !Array.isArray(necesidades) || necesidades.length === 0) {
                throw new AppError("VALIDATION_ERROR", 400, "El texto y al menos una necesidad son obligatorios");
            }

            const publication = await publicationService.createPublication(userId, req.body);

            sendSuccess(res, serializePublication(publication), 201);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const publication = await publicationService.getPublicationWithAuthor(id);

            sendSuccess(res, serializePublication(publication), 200);
        } catch (error) {
            next(error);
        }
    }

    async listApproved(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(String(req.query.page)) || 1;
            const limit = Math.min(parseInt(String(req.query.limit)) || 10, 50);

            const options = {
                page,
                limit,
                sort: { created_at: -1 }
            };

            // El feed público siempre es "aprobada". Solo el admin puede pedir otro
            // estado (p. ej. "pendiente" para moderar) pasando ?status=.
            let status: PublicationStatus = "aprobada";
            const requestedStatus = req.query.status;
            if (
                req.user?.role === "admin" &&
                typeof requestedStatus === "string" &&
                (PUBLICATION_STATUS as readonly string[]).includes(requestedStatus)
            ) {
                status = requestedStatus as PublicationStatus;
            }

            const search = typeof req.query.search === "string" ? req.query.search : undefined;
            const result = await publicationService.listPublications(options, status, search);

            sendSuccess(res, result.docs.map(serializePublication), 200, {
                page: result.page,
                limit: result.limit,
                total: result.totalDocs,
                pages: result.totalPages
            });
        } catch (error) {
            next(error);
        }
    }

    async listByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = String(req.params.id);
            const page = parseInt(String(req.query.page)) || 1;
            const limit = Math.min(parseInt(String(req.query.limit)) || 10, 50);

            const options = {
                page,
                limit,
                sort: { created_at: -1 }
            };

            const result = await publicationService.listUserPublications(userId, options);

            sendSuccess(res, result.docs.map(serializePublication), 200, {
                page: result.page,
                limit: result.limit,
                total: result.totalDocs,
                pages: result.totalPages
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Usuario no autenticado");

            const id = String(req.params.id);
            const updated = await publicationService.updatePublication(id, userId, req.body);

            if (!updated) {
                throw new AppError("NOT_FOUND", 404, "La publicación no existe o no tienes permiso para editarla");
            }

            sendSuccess(res, serializePublication(updated), 200);
        } catch (error) {
            next(error);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Usuario no autenticado");

            const id = String(req.params.id);
            await publicationService.deletePublication(id, userId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async moderate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { status } = req.body;
            if (!status) throw new AppError("VALIDATION_ERROR", 400, "El estado es obligatorio para moderar");

            const id = String(req.params.id);
            const moderated = await publicationService.moderatePublication(id, status);

            if (!moderated) {
                throw new AppError("NOT_FOUND", 404, "La publicación no existe o ya ha sido moderada");
            }

            sendSuccess(res, serializePublication(moderated), 200);
        } catch (error) {
            next(error);
        }
    }

    async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!(req as any).file) {
                throw new AppError("BAD_REQUEST", 400, "No se ha subido ninguna imagen");
            }
            const userId = req.user?.id;
            if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Usuario no autenticado");

            const id = String(req.params.id);
            const fileName = (req as any).file.filename;
            const updated = await publicationService.updatePublicationImage(id, userId, fileName);

            if (!updated) {
                throw new AppError("NOT_FOUND", 404, "La publicación no existe o no tienes permiso para subir una imagen");
            }

            sendSuccess(res, serializePublication(updated), 200);
        } catch (error) {
            next(error);
        }
    }
}

export default new PublicationController();
