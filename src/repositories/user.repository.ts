import User, { IUser } from "../models/user";
import { escapeRegex } from "../utils/escapeRegex";

class UserRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email: email.toLowerCase() });
    }

    async findByNick(nick: string): Promise<IUser | null> {
        return await User.findOne({ nick: nick.toLowerCase() });
    }

    async findById(id: string): Promise<IUser | null> {
        return await User.findById(id).select("-password");
    }

    // Solo para verificar la contraseña actual antes de cambiarla (UserService.updateProfile).
    async findByIdWithPassword(id: string): Promise<IUser | null> {
        return await User.findById(id);
    }

    async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    }

    async findAll(page: number, limit: number): Promise<{ users: IUser[], total: number }> {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find()
                .select("_id name surname nick image role")
                .skip(skip)
                .limit(limit),
            User.countDocuments()
        ]);
        return { users, total };
    }

    async findByCriteria(criteria: { email: string; nick: string }): Promise<IUser[]> {
        return await User.find({
            $or: [
                { email: criteria.email.toLowerCase() },
                { nick: criteria.nick.toLowerCase() }
            ]
        });
    }

    async create(userData: Partial<IUser>): Promise<any> {
        const user = new User(userData);
        const savedUser = await user.save();

        // Convertimos a objeto plano y eliminamos el password antes de devolverlo
        const userObj = savedUser.toObject() as any;
        delete userObj.password;

        return userObj;
    }

    // "Guardados": ids en el orden en que se guardaron (el más reciente al final).
    async findSavedPublicationIds(userId: string): Promise<string[]> {
        const user = await User.findById(userId).select("saved_publications");
        if (!user) return [];
        return user.saved_publications.map((id) => id.toString());
    }

    async addSavedPublication(userId: string, publicationId: string): Promise<void> {
        await User.findByIdAndUpdate(userId, { $addToSet: { saved_publications: publicationId } });
    }

    async removeSavedPublication(userId: string, publicationId: string): Promise<void> {
        await User.findByIdAndUpdate(userId, { $pull: { saved_publications: publicationId } });
    }

    // Para la búsqueda del navbar: ids de usuarios cuyo nombre coincide (para
    // poder buscar publicaciones por el nombre del beneficiario).
    async findIdsByNameMatch(text: string): Promise<string[]> {
        const users = await User.find({ name: { $regex: escapeRegex(text), $options: "i" } }).select("_id");
        return users.map((u) => (u._id as any).toString());
    }
}

export default new UserRepository();
