import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useState } from "react";
import { Alert, Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import ReCAPTCHA from "react-google-recaptcha";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { request } from "../commons";
import CustomSpinner from "../components/Spinner";
import { AuthContext } from "../providers/AuthProvider";
import styles from "../styles/Login.module.css";
import AuthCode from "react-auth-code-input";

const Login: NextPage = () => {
  const [error, setError] = useState("");
  const [g_response, setRecaptchaResponse] = useState<string | null>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setConfirmationForm] = useState(false);
  const recaptchaRef = React.createRef<ReCAPTCHA>();
  const router = useRouter();
  const auth = useContext(AuthContext);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!g_response) {
      setError("Solve the Recaptcha.");
    }

    setLoading(true);

    try {
      await request("POST", "user/initlogin", { email, password, g_response });
      setLoading(false);
      setError("");
      setConfirmationForm(true);
      // router.push("/dashboard");
    } catch (error) {
      // reset captcha
      recaptchaRef.current?.reset();
      setError((error as Error).message);
    }

    setLoading(false);
  };

  const confirmationCodeChange = async (code: string) => {
    if (!code || code.length !== 6) return;

    setLoading(true);

    try {
      await request("POST", "user/finalizelogin", { code });
      auth.setLoggedIn(true);
      router.push("/dashboard");
    } catch (error) {
      // reset captcha
      recaptchaRef.current?.reset();
      setError((error as Error).message);
    }

    setLoading(false);
  };

  if (loading) {
    return <CustomSpinner />;
  }

  return (
    <>
      <Container className="d-flex flex-column align-items-center">
        <Row>
          {error && (
            <Alert key={"danger"} variant={"danger"}>
              {error}
            </Alert>
          )}
        </Row>
        {showVerification && (
          <>
            <Row>
              <h1 className="text-center">
                Two-Factor <br />
                Authentication
              </h1>
            </Row>
            <Row className="mt-4">
              <AuthCode inputClassName={styles.input2fa} onChange={confirmationCodeChange} />
            </Row>
            <Row className="mt-4">
              <p className="text-center">
                A message with a verification code has been sent to <br />
                your email. Enter the code to continue.
              </p>
            </Row>
          </>
        )}
        {!showVerification && (
          <>
            <Row>
              <h1 className="text-center">Welcome back!</h1>
            </Row>
            <Form onSubmit={onFormSubmit} className={`${styles.formGroup} mt-4`}>
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
                  className="d-flex justify-content-center"
                />
              </Form.Group>

              <div className={`d-grid gap-2 mt-3`}>
                <Button variant="primary" type="submit" className={`${styles.submit} mb-2`}>
                  Sign in
                </Button>
              </div>
              <div className={`d-flex mt-3 flex-column text-center`}>
                <Link href="/resetpassword">Forgot password?</Link>
                <Link href="/register">Don&apos;t have an account?</Link>
              </div>
            </Form>
          </>
        )}
      </Container>
    </>
  );
};

export default Login;
