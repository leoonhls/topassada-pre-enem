import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthError } from "firebase/auth";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      console.log("Login realizado com sucesso");
      navigate("/");
    } catch (error) {
      setError((error as AuthError).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
  };

  return (
    <div>
      <div className="max-w-[400px] space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="flex flex-col text-center items-center justify-center">
              <Avatar className="h-50 w-50 rounded-md">
                <AvatarImage
                  src="src\assets\to-passada-icon.png"
                  alt="Tô Passada Pré-Enem"
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
            </CardTitle>
            <CardDescription className="text-center">
              Faça o Login com seu email e senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form method="POST" className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nome@email.com.br"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
                      Esqueci minha senha
                    </a>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="text-destructive text-sm text-center">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Carregando...
                    </span>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="self-center text-muted-foreground text-xs text-balance">
            <div className="">
              Powered by{" "}
              <a
                href="#"
                className="hover:text-primary underline underline-offset-4">
                ByteForge
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
