import { LoginForm } from "@/features/user/LoginForm";

function Login() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-evenly bg-muted px-4">
      <LoginForm />
    </div>
    // <div className="bg-muted flex h-full justify-center gap-6 p-3 items-center">
    //   <div className="flex flex-col gap-2 justify-center">
    //     <div className="flex items-center gap-2 self-center font-medium">
    //       <Avatar className="h-12 w-12 rounded-md">
    //         <AvatarImage
    //           src="src\assets\topassada-pre-enem-icon.png"
    //           alt="Tô Passada!"
    //         />
    //         <AvatarFallback className="rounded-lg">CN</AvatarFallback>
    //       </Avatar>
    //       Tô Passada!
    //     </div>
    //     <LoginForm />
    //   </div>
    // </div>
  );
}

export default Login;
