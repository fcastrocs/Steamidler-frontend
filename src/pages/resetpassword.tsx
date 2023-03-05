import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Form, InputGroup } from "react-bootstrap";
import ReCAPTCHA from "react-google-recaptcha";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { request } from "../commons";
import CustomSpinner from "../components/Spinner";
import { AuthContext } from "../providers/AuthProvider";
import { ToastContext } from "../providers/ToastProvider";
import styles from "../styles/Login.module.css";

const ResetPassword: NextPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [g_response, setRecaptchaResponse] = useState<string | null>("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordValidation, setPasswordValidation] = useState([false, false, false, false, false, false]);
  const [showPassword, setShowPassword] = useState("password");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const recaptchaRef = React.createRef<ReCAPTCHA>();
  const auth = useContext(AuthContext);
  const addToast = useContext(ToastContext);

  useEffect(() => {
    if (!router.isReady) return;
    setEmail(router.query.email as string);
    setToken(router.query.token as string);
    setLoading(false);
  }, [router.isReady]);

  const getPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!g_response) {
      setError("Solve the Recaptcha.");
    }

    setLoading(true);

    try {
      await request("POST", "user/resetpassword", { email, g_response });
      setSuccess(`Reset email has been sent to ${email}`);
    } catch (error) {
      // reset captcha
      recaptchaRef.current?.reset();
      setError((error as Error).message);
    }

    setLoading(false);
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!g_response) {
      setError("Solve the Recaptcha.");
    }

    console.log(password);
    if (!password) {
      return;
    }

    setLoading(true);

    try {
      await request("POST", "user/updatepassword", { token, email, password, g_response });
      auth.setLoggedIn(true);
      addToast("Password has been updated.");
      router.push("/dashboard");
    } catch (error) {
      // reset captcha
      recaptchaRef.current?.reset();
      setError((error as Error).message);
    }

    setLoading(false);
  };

  const validatePassword = (password: string) => {
    // Validate password
    const validation = [false, false, false, false, false, false];

    // must be 8-32 characters long
    validation[0] = /^.{8,32}$/.test(password);
    // at least one digit
    validation[1] = /[0-9]/.test(password);
    // at least one lowercase letter
    validation[2] = /[a-z]/.test(password);
    // at least one uppercase letter
    validation[3] = /[A-Z]/.test(password);
    // at least special character
    validation[4] = /[^A-Za-z0-9\s]/.test(password);
    // no spaces
    validation[5] = /^\S*$/.test(password);

    const isValid = validation.every((v) => v);

    if (isValid) setPassword(password);
    else setPassword("");

    setPasswordValidation(validation);
  };

  if (loading) {
    return <CustomSpinner />;
  }

  if (success) {
    return (
      <Alert key={"success"} variant={"success"}>
        {success}
      </Alert>
    );
  }

  return (
    <>
      <h1 className={`${styles.header}`}>Reset your password</h1>
      {error && (
        <Alert key={"danger"} variant={"danger"}>
          {error}
        </Alert>
      )}
      {!token && (
        <Form onSubmit={getPasswordReset} className={`mt-5 ${styles.formGroup}`}>
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

          <Form.Group className={`mb-3`}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LdaT2ohAAAAAHRbgi2JihngnUOW_KPz28z4ZFP0"
              onChange={(value) => setRecaptchaResponse(value)}
            />
          </Form.Group>

          <div className={`d-grid gap-2 mt-3`}>
            <Button variant="primary" type="submit" className={`${styles.submit} mb-2`}>
              Reset Password
            </Button>
          </div>
        </Form>
      )}
      {email && token && (
        <Form onSubmit={updatePassword} className={`mt-5 ${styles.formGroup}`}>
          <InputGroup className={`mb-3`}>
            <InputGroup.Text id="password-addon">
              <MdPassword />
            </InputGroup.Text>
            <Form.Control
              required
              type={showPassword}
              placeholder="Password"
              className={`${styles.input}`}
              onChange={(e) => validatePassword(e.target.value)}
              aria-describedby="password-addon"
            />
            <InputGroup.Text onClick={() => setShowPassword("text")}>
              <a>Show</a>
            </InputGroup.Text>
          </InputGroup>

          <InputGroup className={`mb-3`}>
            <div className="ps-3">
              <div>
                <span>{passwordValidation[0] ? "✅" : ""}</span>
                <span>8-32 characters long</span>
              </div>
              <div>
                <span>{passwordValidation[1] ? "✅" : ""}</span>
                <span>At least one digit</span>
              </div>
              <div>
                <span>{passwordValidation[2] ? "✅" : ""}</span>
                <span>At least one lowercase letter</span>
              </div>
              <div>
                <span>{passwordValidation[3] ? "✅" : ""}</span>
                <span>At least one uppercase letter</span>
              </div>
              <div>
                <span>{passwordValidation[4] ? "✅" : ""}</span>
                <span>At least one special character</span>
              </div>
              <div>
                <span>{passwordValidation[5] ? "✅" : ""}</span>
                <span>No spaces</span>
              </div>
            </div>
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
              Change Password
            </Button>
          </div>
        </Form>
      )}
    </>
  );
};

export default ResetPassword;
