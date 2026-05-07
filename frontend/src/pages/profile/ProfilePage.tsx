import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { User, Mail, Phone, Edit2, Lock, Camera, CheckCircle } from "lucide-react";
import { profileService } from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const profileSchema = z.object({
  first_name: z.string().min(1, "Requis"),
  last_name: z.string().min(1, "Requis"),
  bio: z.string().optional(),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  old_password: z.string().min(1, "Requis"),
  new_password: z.string().min(8, "8 caractères minimum"),
  new_password_confirm: z.string().min(1, "Requis"),
}).refine((d) => d.new_password === d.new_password_confirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["new_password_confirm"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const ROLE_LABELS: Record<string, string> = { admin: "Administrateur", teacher: "Enseignant", student: "Étudiant" };
const ROLE_COLORS: Record<string, "blue" | "orange" | "purple"> = { admin: "purple", teacher: "orange", student: "blue" };

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState<"info" | "password">("info");
  const [success, setSuccess] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);

  const { register: regProfile, handleSubmit: hsProfile, formState: { errors: errProfile } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: user?.first_name ?? "", last_name: user?.last_name ?? "", bio: user?.bio ?? "", phone: "" },
  });

  const { register: regPwd, handleSubmit: hsPwd, reset: resetPwd, formState: { errors: errPwd } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) => profileService.update(data),
    onSuccess: (updated) => { setUser(updated); setSuccess("Profil mis à jour !"); setTimeout(() => setSuccess(""), 3000); },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordForm) => profileService.changePassword(data),
    onSuccess: () => { resetPwd(); setSuccess("Mot de passe modifié !"); setTimeout(() => setSuccess(""), 3000); },
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => { const fd = new FormData(); fd.append("avatar", file); return profileService.update(fd); },
    onSuccess: (updated) => setUser(updated),
  });

  const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() || user?.email[0].toUpperCase();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mon Profil</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-esatic-blue flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
            )}
            <button onClick={() => avatarRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-esatic-orange rounded-full flex items-center justify-center shadow-md hover:bg-orange-600 transition">
              <Camera size={13} className="text-white" />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) avatarMutation.mutate(f); }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user?.first_name} {user?.last_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={ROLE_COLORS[user?.role ?? "student"]}>{ROLE_LABELS[user?.role ?? "student"]}</Badge>
              {user?.is_verified && (
                <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle size={12} /> Vérifié</span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {(["info", "password"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setSuccess(""); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${tab === t ? "bg-white text-esatic-blue shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "info" ? <><User size={14} /> Informations</> : <><Lock size={14} /> Sécurité</>}
          </button>
        ))}
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {tab === "info" && (
        <form onSubmit={hsProfile((d) => profileMutation.mutate(d))} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input {...regProfile("first_name")} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue" />
              {errProfile.first_name && <p className="text-red-500 text-xs mt-1">{errProfile.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input {...regProfile("last_name")} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue" />
              {errProfile.last_name && <p className="text-red-500 text-xs mt-1">{errProfile.last_name.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"><Mail size={14} className="inline mr-1" />Email</label>
            <input value={user?.email} disabled className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"><Phone size={14} className="inline mr-1" />Téléphone</label>
            <input {...regProfile("phone")} placeholder="+225 07 XX XX XX XX" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea {...regProfile("bio")} rows={3} placeholder="Parlez de vous..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue resize-none" />
          </div>
          <Button type="submit" loading={profileMutation.isPending}><Edit2 size={14} className="mr-2" /> Sauvegarder</Button>
        </form>
      )}

      {tab === "password" && (
        <form onSubmit={hsPwd((d) => passwordMutation.mutate(d))} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
          {([
            { name: "old_password" as const, label: "Mot de passe actuel" },
            { name: "new_password" as const, label: "Nouveau mot de passe" },
            { name: "new_password_confirm" as const, label: "Confirmer le nouveau" },
          ]).map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input {...regPwd(name)} type="password" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue" />
              {errPwd[name] && <p className="text-red-500 text-xs mt-1">{errPwd[name]?.message}</p>}
            </div>
          ))}
          <Button type="submit" loading={passwordMutation.isPending}><Lock size={14} className="mr-2" /> Changer le mot de passe</Button>
        </form>
      )}
    </div>
  );
}
