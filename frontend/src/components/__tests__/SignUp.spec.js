import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import SignUp from "../../views/SignUp.vue";
import { useAuthStore } from "../../apiStore/authStore";

// --- Mock del router antes de montar el componente ---
const pushMock = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock })
}));

describe("SignUp.vue", () => {
  let authStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();

    // --- Mock del store ---
    authStore.isAuthenticated = false;
    authStore.loading = false;
    authStore.error = null;
    authStore.initializeAuthStore = vi.fn();
    authStore.signUp = vi.fn().mockResolvedValue();
    authStore.logout = vi.fn().mockResolvedValue();

    // Limpiar llamadas previas al mock del router
    pushMock.mockClear();
  });

  it("renders sign up form", () => {
    const wrapper = mount(SignUp);
    expect(wrapper.text()).toContain("Registra't i gaudeix de totes les funcionalitats");
  });

  it("shows error if fields are empty", async () => {
    const wrapper = mount(SignUp);

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.find(".form-error").text()).toBe("Has d'omplir tots els camps");
  });

  it("shows error if passwords do not match", async () => {
    const wrapper = mount(SignUp);

    await wrapper.find("#username").setValue("user1");
    await wrapper.find("#email").setValue("a@a.com");
    await wrapper.find("#password").setValue("12345");
    await wrapper.find("#password_conf").setValue("54321");

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.find(".form-error").text()).toBe("Les contrasenyes no coincideixen");
  });

  it("calls authStore.signUp with correct data", async () => {
    const wrapper = mount(SignUp);

    await wrapper.find("#username").setValue("user1");
    await wrapper.find("#email").setValue("a@a.com");
    await wrapper.find("#password").setValue("12345");
    await wrapper.find("#password_conf").setValue("12345");

    await wrapper.find("form").trigger("submit.prevent");

    expect(authStore.signUp).toHaveBeenCalledWith({
      username: "user1",
      email: "a@a.com",
      password: "12345",
      password_conf: "12345"
    });
  });

  it("redirects to login when clicking Inicia sessió button", async () => {
    const wrapper = mount(SignUp);

    const loginButton = wrapper.findAll("button").find(btn => btn.text() === "Inicia sessió");
    expect(loginButton).toBeTruthy();

    await loginButton.trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/login");
  });
});
