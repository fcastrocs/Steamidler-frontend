import React, { useContext, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { AuthContext } from "../../pages/_app";
import { logUserIn, request } from "../../commons";
import { Alert, Button, Form, InputGroup, Modal } from "react-bootstrap";
import { MdOutlineAccountCircle, MdOutlineMail, MdOutlineVpnKey, MdPassword } from "react-icons/md";

export default function RegisterModal() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <div onClick={handleShow}>
        <span>Register</span>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Register</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RegisterForm />
        </Modal.Body>
      </Modal>
    </>
  );
}

function RegisterForm() {
  const [error, setError] = useState("");
  const [g_response, setRecaptchaResponse] = useState<string | null>("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState("");
  const [showPassword, setShowPassword] = useState("password");
  const auth = useContext(AuthContext);
  const recaptchaRef = React.createRef<ReCAPTCHA>();
  const [passwordValidation, setPasswordValidation] = useState([false, false, false, false, false, false]);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password || !invite || !g_response) {
      setError("Complete the form.");
      return;
    }

    try {
      const userInfo = await request("POST", "user/register", { username, email, password, g_response });
      logUserIn(userInfo, auth.setIsLoggedIn);
    } catch (error) {
      // reset captcha
      recaptchaRef.current?.reset();
      setError((error as Error).message);
    }
  };

  const validatePassword = (password: string) => {
    setPasswordValidation([false, false, false, false, false, false]);

    // Validate password
    const validation = [...passwordValidation];

    // must be 8-32 characters long
    validation[0] = /^.{8,32}$/.test(password) ? true : false;
    // at least one digit
    validation[1] = /[0-9]/.test(password) ? true : false;
    // at least one lowercase letter
    validation[2] = /[a-z]/.test(password) ? true : false;
    // at least one uppercase letter
    validation[3] = /[A-Z]/.test(password) ? true : false;
    // at least special character
    validation[4] = /[^A-Za-z0-9\s]/.test(password) ? true : false;
    // no spaces
    validation[5] = /^\S*$/.test(password) ? true : false;

    setPasswordValidation(validation);

    let isValid = false;
    for (const value of passwordValidation) {
      if (value === true) isValid = true;
      else isValid = false;
    }

    if (isValid) setPassword(password);
    else setPassword("");
  };

  const validateUsername = (username: string) => {
    if (/[a-zA-Z0-9]{3,12}/.test(username)) {
      setUsername(username);
    } else {
      setUsername("");
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
        <InputGroup.Text id="username-addon">
          <MdOutlineAccountCircle />
        </InputGroup.Text>
        <Form.Control
          required
          type="text"
          placeholder="Username"
          onChange={(e) => validateUsername(e.target.value)}
          aria-describedby="username-addon"
        />
      </InputGroup>

      <InputGroup className="mb-4">
        <div>
          <div>
            <span>{username ? "✅" : "❌"}</span>
            <span>3-12 characters long</span>
          </div>
        </div>
      </InputGroup>

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
          type={showPassword}
          placeholder="Password"
          onChange={(e) => validatePassword(e.target.value)}
          aria-describedby="password-addon"
        />
        <InputGroup.Text onClick={() => setShowPassword("text")}>
          <a>Show</a>
        </InputGroup.Text>
      </InputGroup>

      <InputGroup className="mb-4">
        <div>
          <div>
            <span>{passwordValidation[0] ? "✅" : "❌"}</span>
            <span>8-32 characters long</span>
          </div>
          <div>
            <span>{passwordValidation[1] ? "✅" : "❌"}</span>
            <span>at least one digit</span>
          </div>
          <div>
            <span>{passwordValidation[2] ? "✅" : "❌"}</span>
            <span>at least one lowercase letter</span>
          </div>
          <div>
            <span>{passwordValidation[3] ? "✅" : "❌"}</span>
            <span>at least one uppercase letter</span>
          </div>
          <div>
            <span>{passwordValidation[4] ? "✅" : "❌"}</span>
            <span>at least one special character</span>
          </div>
          <div>
            <span>{passwordValidation[5] ? "✅" : "❌"}</span>
            <span>no spaces</span>
          </div>
        </div>
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text id="invite-addon">
          <MdOutlineVpnKey />
        </InputGroup.Text>
        <Form.Control
          required
          type="text"
          placeholder="Invite Code"
          onChange={(e) => setInvite(e.target.value)}
          aria-describedby="invite-addon"
        />
      </InputGroup>

      <Form.Group className="mb-3">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6LdaT2ohAAAAAHRbgi2JihngnUOW_KPz28z4ZFP0"
          onChange={(value) => setRecaptchaResponse(value)}
        />
      </Form.Group>

      <div className="d-grid gap-2">
        <Button variant="primary" type="submit">
          Register
        </Button>
      </div>
    </Form>
  );
}
