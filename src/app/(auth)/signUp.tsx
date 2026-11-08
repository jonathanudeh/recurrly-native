import { useSignUp } from "@clerk/expo";
import { router } from "expo-router";
import { useRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import AuthField from "../../../components/AuthField";
import AuthMessage from "../../../components/AuthMessage";
import AuthScreen from "../../../components/AuthScreen";
import {
  getClerkErrorMessage,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  validateEmail,
  validatePassword,
} from "../../../lib/auth";

type SignUpStep = "details" | "verification";

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [step, setStep] = useState<SignUpStep>("details");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const passwordInputRef = useRef<ComponentRef<typeof TextInput> | null>(null);

  const isBusy = fetchStatus === "fetching";
  const globalError = errors.global?.[0]?.longMessage;

  function showError(text: string) {
    setMessageTone("error");
    setMessage(text);
  }

  function showSuccess(text: string) {
    setMessageTone("success");
    setMessage(text);
  }

  async function finalizeSignUp() {
    const { error } = await signUp.finalize({
      navigate: () => router.replace("/(tabs)"),
    });

    if (error) {
      showError(
        getClerkErrorMessage(
          error,
          "Your account is ready, but we couldn't finish signing you in. Please try again.",
        ),
      );
    }
  }

  async function submitDetails() {
    setMessage(null);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError) {
      showError(emailError);
      return;
    }
    if (passwordError) {
      showError(passwordError);
      return;
    }
    try {
      const { error } = await signUp.password({
        emailAddress: normalizeEmail(email),
        password,
      });

      if (error) {
        showError(
          getClerkErrorMessage(
            error,
            "We couldn't create your account. Check your details and try again.",
          ),
        );
        return;
      }

      if (
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields.includes("email_address")
      ) {
        const { error: sendError } = await signUp.verifications.sendEmailCode();

        if (sendError) {
          showError(
            getClerkErrorMessage(
              sendError,
              "We couldn't send a verification code. Please try again.",
            ),
          );
          return;
        }

        setStep("verification");
        showSuccess(`We sent a verification code to ${normalizeEmail(email)}.`);
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      showError(
        "Your account needs another step before it can be created. Please try again or contact support.",
      );
    } catch (error) {
      showError(
        getClerkErrorMessage(
          error,
          "We couldn't connect. Check your internet connection and try again.",
        ),
      );
    }
  }

  async function verifyEmail() {
    setMessage(null);
    if (!code.trim()) {
      showError("Enter the verification code from your email.");
      return;
    }

    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (error) {
        showError(
          getClerkErrorMessage(
            error,
            "That code didn't work. Check it and try again.",
          ),
        );
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      showError(
        "Your email is verified, but your account needs another step. Please contact support.",
      );
    } catch (error) {
      showError(
        getClerkErrorMessage(
          error,
          "We couldn't verify your email. Please try again.",
        ),
      );
    }
  }

  async function resendCode() {
    setMessage(null);
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        showError(
          getClerkErrorMessage(
            error,
            "We couldn't send another code. Please try again.",
          ),
        );
        return;
      }
      showSuccess(`A new code was sent to ${normalizeEmail(email)}.`);
    } catch (error) {
      showError(
        getClerkErrorMessage(
          error,
          "We couldn't send another code. Please try again.",
        ),
      );
    }
  }

  async function changeEmail() {
    setMessage(null);
    setCode("");
    try {
      await signUp.reset();
      setStep("details");
    } catch (error) {
      showError(
        getClerkErrorMessage(
          error,
          "We couldn't restart sign-up. Please try again.",
        ),
      );
    }
  }

  const title =
    step === "verification" ? "Check your inbox" : "Create your account";
  const subtitle =
    step === "verification"
      ? `Enter the code we sent to ${normalizeEmail(email)}.`
      : "Start making sense of every subscription.";

  return (
    <AuthScreen
      title={title}
      subtitle={subtitle}
      footer={
        step === "verification" ? (
          <Pressable
            accessibilityRole="button"
            disabled={isBusy}
            onPress={changeEmail}
          >
            <Text className="auth-link">Use a different email</Text>
          </Pressable>
        ) : (
          <>
            <Text className="auth-link-copy">Already have an account?</Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.replace("/(auth)/signIn")}
            >
              <Text className="auth-link">Sign in</Text>
            </Pressable>
          </>
        )
      }
    >
      <View className="auth-form">
        <AuthMessage
          message={message ?? globalError}
          tone={message ? messageTone : "error"}
        />
        {step === "details" ? (
          <>
            <AuthField
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!isBusy}
              error={errors.fields.emailAddress?.message}
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              onSubmitEditing={() =>
                TextInput.State.focusTextInput(
                  passwordInputRef.current ?? undefined,
                )
              }
              placeholder="Enter your email"
              returnKeyType="next"
              textContentType="emailAddress"
              value={email}
            />
            <AuthField
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!isBusy}
              error={errors.fields.password?.message}
              label="Password"
              onChangeText={setPassword}
              onSubmitEditing={submitDetails}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              ref={passwordInputRef}
              returnKeyType="done"
              secure
              textContentType="newPassword"
              value={password}
            />
            <Pressable
              accessibilityRole="button"
              className={
                isBusy ? "auth-button auth-button-disabled" : "auth-button"
              }
              disabled={isBusy}
              onPress={submitDetails}
            >
              {isBusy ? (
                <ActivityIndicator color="#fff9e3" />
              ) : (
                <Text className="auth-button-text">Create account</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <AuthField
              autoCapitalize="none"
              autoComplete="one-time-code"
              error={errors.fields.code?.message}
              editable={!isBusy}
              keyboardType="number-pad"
              label="Verification code"
              maxLength={10}
              onChangeText={setCode}
              onSubmitEditing={verifyEmail}
              placeholder="Enter the code from your email"
              returnKeyType="done"
              textContentType="oneTimeCode"
              value={code}
            />
            <Pressable
              accessibilityRole="button"
              className={
                isBusy ? "auth-button auth-button-disabled" : "auth-button"
              }
              disabled={isBusy}
              onPress={verifyEmail}
            >
              {isBusy ? (
                <ActivityIndicator color="#fff9e3" />
              ) : (
                <Text className="auth-button-text">Verify email</Text>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="auth-secondary-button"
              disabled={isBusy}
              onPress={resendCode}
            >
              <Text className="auth-secondary-button-text">
                Send a new code
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </AuthScreen>
  );
}
