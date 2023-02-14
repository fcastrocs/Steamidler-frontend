import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Form, InputGroup } from "react-bootstrap";
import ReCAPTCHA from "react-google-recaptcha";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { request } from "../commons";
import { AuthContext } from "../components/AuthProvider";
import styles from "../styles/Login.module.css";

const Login: NextPage = () => {
  const [error, setError] = useState("");
  const [g_response, setRecaptchaResponse] = useState<string | null>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const recaptchaRef = React.createRef<ReCAPTCHA>();
  const router = useRouter();
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (auth.isLoggedIn) router.push("/dashboard");
  }, [auth.isLoggedIn]);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!g_response) {
      setError("Solve the Recaptcha.");
    }

    try {
      await request("POST", "user/login", { email, password, g_response });
      auth.setLoggedIn(true);
    } catch (error) {
      // reset captcha
      recaptchaRef.current?.reset();
      setError((error as Error).message);
    }
  };

  return (
    <>
      <h1 className={`${styles.header}`}>Sign in to access your account</h1>
      <Form onSubmit={onFormSubmit} className={`mt-5 ${styles.formGroup}`}>
        {error && (
          <Alert key={"danger"} variant={"danger"}>
            {error}
          </Alert>
        )}

        <InputGroup className={`mb-3`}>
          <InputGroup.Text id="email-addon" className={`${styles.addon}`}>
            <MdOutlineMail />
          </InputGroup.Text>
          <Form.Control
            required
            type="email"
            placeholder="Email"
            className={`${styles.input}`}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby="email-addon"
          />
        </InputGroup>

        <InputGroup className={`mb-3`}>
          <InputGroup.Text id="password-addon" className={`${styles.addon}`}>
            <MdPassword />
          </InputGroup.Text>
          <Form.Control
            required
            type="password"
            placeholder="Password"
            className={`${styles.input}`}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="password-addon"
          />
        </InputGroup>

        <Form.Group className={`mb-3`}>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="6LdaT2ohAAAAAHRbgi2JihngnUOW_KPz28z4ZFP0"
            onChange={(value) => setRecaptchaResponse(value)}
          />
        </Form.Group>

        <div className={`d-grid gap-2 mt-3`}>
          <Button variant="primary" type="submit" className={`${styles.submit} mb-2`}>
            Sign in
          </Button>
        </div>
        <div className={`d-flex mt-3 flex-column text-center`}>
          <Link href="/">Forgot password?</Link>
          <Link href="/register">Don't have an account?</Link>
        </div>
      </Form>
    </>
  );
};

export default Login;
