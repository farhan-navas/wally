import { SignIn } from "@clerk/nextjs";
// import LogInPage from "../../_components/login";

export default function CustomSignIn() {
  // return <LogInPage />;
  return (
    <div>
      <SignIn />
    </div>
  );
}
