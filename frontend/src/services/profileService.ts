import api from "./api";
import type { User } from "@/types";

export const profileService = {
  get: () => api.get<User>("/auth/profile/").then((r) => r.data),
  update: (data: Partial<User> | FormData) => {
    const isFormData = data instanceof FormData;
    return api.patch<User>("/auth/profile/", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    }).then((r) => r.data);
  },
  changePassword: (data: { old_password: string; new_password: string; new_password_confirm: string }) =>
    api.put("/auth/change-password/", data).then((r) => r.data),
};
