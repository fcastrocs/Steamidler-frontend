import styles from "../../styles/Auth.module.css";

import { Alert, Button, Form, Input, Modal } from "antd";
import React, { useContext, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { AuthContext } from "../../pages/_app";
import { checkResponseStatus, logUserIn } from "../../commons";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

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

  const [form] = Form.useForm();

  return (
    <div>
      {error && <Alert message={error} type="error" showIcon />}
      <Form form={form} name="login" onFinish={onFormSubmit}>
        <Form.Item name="email" rules={[{ required: true, message: "Please input your username!" }]}>
          <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="email" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
          <Input prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="6LdaT2ohAAAAAHRbgi2JihngnUOW_KPz28z4ZFP0"
            onChange={onRecaptchaVerify}
          />
        </Form.Item>

        <Form.Item shouldUpdate>
          {() => (
            <Button
              type="primary"
              htmlType="submit"
              disabled={
                !form.isFieldsTouched(true) ||
                !!form.getFieldsError().filter(({ errors }) => errors.length).length ||
                !recaptchaResponse
              }
            >
              Log in
            </Button>
          )}
        </Form.Item>
      </Form>
    </div>
  );
}
