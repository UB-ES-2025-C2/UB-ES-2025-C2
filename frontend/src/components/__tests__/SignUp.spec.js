import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import SignUp from "../../views/SignUp.vue";
import { useAuthStore } from "../../store/authStore";

describe("SignUp.vue", () => {
  let authStore;

  beforeEach(() => {
    // Crear un Pinia real para que useAuthStore funcione
    setActivePinia(createPinia());
    authStore = useAuthStore();

    // Mockear métodos y propiedades
    authStore.isAuthenticated = false;
    authStore.loading = false;
    authStore.error = null;
    authStore.initializeAuthStore = vi.fn();
    authStore.signUp = vi.fn();
    authStore.logout = vi.fn();
  });

  it("renders sign up form", () => {
    const wrapper = mount(SignUp);
    expect(wrapper.text()).toContain("Sign up");
  });

  it("shows alert if fields are empty", async () => {
    vi.stubGlobal("alert", vi.fn());
    const wrapper = mount(SignUp);
    await wrapper.find("form").trigger("submit.prevent");
    expect(alert).toHaveBeenCalledWith("Please enter both username and password.");
  });

  it("shows alert if passwords do not match", async () => {
    vi.stubGlobal("alert", vi.fn());
    const wrapper = mount(SignUp);
    await wrapper.find("input[placeholder='Username']").setValue("user1");
    await wrapper.find("input[placeholder='Password']").setValue("12345");
    await wrapper.find("input[placeholder='password confirmation']").setValue("54321");
    await wrapper.find("input[placeholder='email']").setValue("a@a.com");

    await wrapper.find("form").trigger("submit.prevent");
    expect(alert).toHaveBeenCalledWith("Passwords do not match");
  });

  it("calls authStore.signUp with correct data", async () => {
    const wrapper = mount(SignUp);
    await wrapper.find("input[placeholder='Username']").setValue("user1");
    await wrapper.find("input[placeholder='Password']").setValue("12345");
    await wrapper.find("input[placeholder='password confirmation']").setValue("12345");
    await wrapper.find("input[placeholder='email']").setValue("a@a.com");

    await wrapper.find("form").trigger("submit.prevent");
    expect(authStore.signUp).toHaveBeenCalledWith({
      username: "user1",
      password: "12345",
      password_conf: "12345",
      email: "a@a.com",
    });
  });
  it("redirects to login when clicking Log In button", async () => {
    const wrapper = mount(SignUp);

    // Mock de window.location
    delete window.location;
    window.location = { href: "" };

    // Encontrar el botón por texto
    const loginButton = wrapper.findAll("button").find(btn => btn.text() === "Log In");

    expect(loginButton).toBeTruthy(); // Comprobamos que sí se encontró
    await loginButton.trigger("click");

    expect(window.location.href).toBe("/");
  });
});
