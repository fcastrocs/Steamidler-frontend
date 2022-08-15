import styles from "../../styles/Auth.module.css";

import { Alert, Button, Form, Input, Modal } from "antd";
import React, { useContext, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { AuthContext } from "../../pages/_app";
import { checkResponseStatus, logUserIn } from "../../commons";
import { KeyOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";

export default function RegisterModal() {
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const handleCancel = (e: React.MouseEvent<HTMLElement>) => setVisible(false);

  return (
    <>
      <div onClick={showModal} className={styles.topHeaderBtn}>
        Register
      </div>
      <Modal title="Register" visible={visible} onCancel={handleCancel} footer={null}>
        <RegisterForm />
      </Modal>
    </>
  );
}

function RegisterForm() {
  const [error, setError] = useState("");
  const [recaptchaResponse, setRecaptchaResponse] = useState("");
  const auth = useContext(AuthContext);
  const recaptchaRef = React.createRef<ReCAPTCHA>();
  const [passwordValidation, setPasswordValidation] = useState([false, false, false, false, false, false]);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

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

  const validatePassword = (allFields: any) => {
    setPasswordValidation([false, false, false, false, false, false]);

    // Validate password
    if (allFields["password"]) {
      const validation = [...passwordValidation];

      // must be 8-32 characters long
      validation[0] = /^.{8,32}$/.test(allFields["password"]) ? true : false;
      // at least one digit
      validation[1] = /[0-9]/.test(allFields["password"]) ? true : false;
      // at least one lowercase letter
      validation[2] = /[a-z]/.test(allFields["password"]) ? true : false;
      // at least one uppercase letter
      validation[3] = /[A-Z]/.test(allFields["password"]) ? true : false;
      // at least special character
      validation[4] = /[^A-Za-z0-9\s]/.test(allFields["password"]) ? true : false;
      // no spaces
      validation[5] = /^\S*$/.test(allFields["password"]) ? true : false;

      setPasswordValidation(validation);
    }

    if (allFields["password2"]) {
      // check that all fields are true
      for (const valid of passwordValidation) {
        if (!valid) return;
      }

      if (allFields["password"] !== allFields["password2"]) {
        setError("Passwords do not match.");
        return;
      }

      setError("");
      setIsPasswordValid(true);
    }
  };

  const onRecaptchaVerify = (value: any) => setRecaptchaResponse(value);

  const [form] = Form.useForm();

  return (
    <div>
      {error && <Alert message={error} type="error" showIcon />}
      <Form
        form={form}
        name="login"
        onFinish={onFormSubmit}
        onValuesChange={(_, allFields) => {
          validatePassword(allFields);
        }}
      >
        <Form.Item name="email" rules={[{ required: true, message: "Please input your username!" }]}>
          <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="email" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item>
          <div className={styles.passwordValidation}>
            <div>
              <span>{passwordValidation[0] ? "✅" : "❌"}</span>
              <span>must be 8-32 characters long</span>
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
              <span>at least special character</span>
            </div>
            <div>
              <span>{passwordValidation[5] ? "✅" : "❌"}</span>
              <span>no space</span>
            </div>
          </div>
        </Form.Item>

        <Form.Item name="password2" rules={[{ required: true, message: "Please input your password!" }]}>
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item name="inviteCode" rules={[{ required: true, message: "Please input your invite code!" }]}>
          <Input prefix={<KeyOutlined />} type="text" placeholder="Invite code" />
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
                !recaptchaResponse ||
                !isPasswordValid
              }
            >
              Register
            </Button>
          )}
        </Form.Item>
      </Form>
    </div>
  );
}
