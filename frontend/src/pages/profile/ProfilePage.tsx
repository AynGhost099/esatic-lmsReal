import { useAuthStore } from "@/store/authStore";
import { User, Mail, Phone } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();

  const roleLabels = { admin: "Administrateur", teacher: "Enseignant", student: "Étudiant" };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mon Profil</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-esatic-blue flex items-center justify-center text-white text-2xl font-bold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {user?.first_name} {user?.last_name}
            </h2>
            <span className="inline-block mt-1 text-sm bg-blue-50 text-esatic-blue px-3 py-1 rounded-full font-medium">
              {user?.role ? roleLabels[user.role] : ""}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-600">
            <Mail size={18} className="text-gray-400" />
            <span>{user?.email}</span>
          </div>
          {user?.bio && (
            <div className="flex items-start gap-3 text-gray-600">
              <User size={18} className="text-gray-400 mt-0.5" />
              <p>{user.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
