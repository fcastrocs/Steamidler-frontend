import styles from "../../styles/Auth.module.css";

import { Alert, Button, Form, Input, Modal } from "antd";
import React, { useContext, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { AuthContext } from "../../pages/_app";
import { checkResponseStatus, logUserIn } from "../../commons";

export default function LoginModal() {
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const handleCancel = (e: React.MouseEvent<HTMLElement>) => setVisible(false);

  return (
    <>
      <div onClick={showModal} className={styles.topHeaderBtn}>
        <span>Login</span>
      </div>
      <Modal title="Login" visible={visible} onCancel={handleCancel} footer={null}>
        <LoginForm />
      </Modal>
    </>
  );
}

function LoginForm() {
  const [error, setError] = useState("");
  const [recaptchaResponse, setRecaptchaResponse] = useState("");
  const auth = useContext(AuthContext);
  const recaptchaRef = React.createRef<ReCAPTCHA>();

  const onFormSubmit = async (form: any) => {
    form["g_response"] = recaptchaResponse;

    try {
      const user = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }).then((response) => checkResponseStatus(response));

      // user registered successfully
      logUserIn(user, auth.setIsLoggedIn);
    } catch (error) {
      // reset captcha
      recaptchaRef.current?.reset();
      const message = (error as Error).message;
      setError(message);
    }
  };

  const onRecaptchaVerify = (value: any) => setRecaptchaResponse(value);

  return (
    <Form
      name="login"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onFormSubmit}
      autoComplete="on"
    >
      {error && <Alert message={error} type="error" showIcon />}

      <Form.Item label="email" name="email" rules={[{ required: true, message: "Please input your email!" }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please input your password!" }]}>
        <Input.Password />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 5 }}>
        <ReCAPTCHA ref={recaptchaRef} sitekey="6LdaT2ohAAAAAHRbgi2JihngnUOW_KPz28z4ZFP0" onChange={onRecaptchaVerify} />
      </Form.Item>

      <hr />
      <Form.Item wrapperCol={{ offset: 0 }}>
        <Button type="primary" htmlType="submit" disabled={!recaptchaResponse}>
          Login
        </Button>
      </Form.Item>
    </Form>
  );
}
