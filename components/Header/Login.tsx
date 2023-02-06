import React, { useContext, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { AuthContext } from "../../pages/_app";
import { logUserIn, request } from "../../commons";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Alert, Form, InputGroup } from "react-bootstrap";
import { MdOutlineMail, MdPassword } from "react-icons/md";

export default function LoginModal() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <div onClick={handleShow}>
        <span>Login</span>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LoginForm />
        </Modal.Body>
      </Modal>
    </>
  );
}

function LoginForm() {
  const [error, setError] = useState("");
  const [g_response, setRecaptchaResponse] = useState<string | null>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useContext(AuthContext);
  const recaptchaRef = React.createRef<ReCAPTCHA>();

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!g_response) {
      setError("Solve the Recaptcha.");
    }

    try {
      const userInfo = await request("POST", "user/login", { email, password, g_response });
      // user logged in successfully
      logUserIn(userInfo, auth.setIsLoggedIn);
    } catch (error) {
      // reset captcha
      recaptchaRef.current?.reset();
      setError((error as Error).message);
    }
  };

  return (
    <Form onSubmit={onFormSubmit}>
      {error && (
        <Alert key={"danger"} variant={"danger"}>
          {error}
        </Alert>
      )}

      <InputGroup className="mb-3">
        <InputGroup.Text id="email-addon">
          <MdOutlineMail />
        </InputGroup.Text>
        <Form.Control
          required
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby="email-addon"
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text id="password-addon">
          <MdPassword />
        </InputGroup.Text>
        <Form.Control
          required
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby="password-addon"
        />
      </InputGroup>

      <Form.Group className="mb-3">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6LdaT2ohAAAAAHRbgi2JihngnUOW_KPz28z4ZFP0"
          onChange={(value) => setRecaptchaResponse(value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <a href="">Forgot password?</a>
      </Form.Group>

      <div className="d-grid gap-2">
        <Button variant="primary" type="submit">
          Login
        </Button>
      </div>
    </Form>
  );
}
