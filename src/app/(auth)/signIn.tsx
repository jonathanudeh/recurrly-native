import { useSignIn } from "@clerk/expo";
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
  getClerkErrorCode,
  getClerkErrorMessage,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  validateEmail,
  validatePassword,
} from "../../../lib/auth";

type SignInStep =
  "password" | "signInCode" | "resetEmail" | "resetCode" | "resetPassword";

const INVALID_CREDENTIAL_CODES = [
  "form_identifier_not_found",
  "form_password_incorrect",
  "form_password_or_identifier_incorrect",
];

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [step, setStep] = useState<SignInStep>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const passwordInputRef = useRef<ComponentRef<typeof TextInput> | null>(null);
  const signInCodeInputRef = useRef<ComponentRef<typeof TextInput> | null>(
    null,
  );
  const resetCodeInputRef = useRef<ComponentRef<typeof TextInput> | null>(null);
  const newPasswordInputRef = useRef<ComponentRef<typeof TextInput> | null>(
    null,
  );
  const confirmationInputRef = useRef<ComponentRef<typeof TextInput> | null>(
    null,
  );

  const isBusy = fetchStatus === "fetching";
  const resetCodeMessage = `If an account exists for ${normalizeEmail(email)}, a reset code is on the way.`;
  const identifierNotFound =
    errors.fields.identifier?.code === "form_identifier_not_found" ||
    errors.global?.some((error) => error.code === "form_identifier_not_found");
  const invalidCredentials = [
    errors.fields.identifier?.code,
    errors.fields.password?.code,
    ...(errors.global ?? []).map((error) => error.code),
  ].some((code) => code && INVALID_CREDENTIAL_CODES.includes(code));
  const globalError = invalidCredentials
    ? undefined
    : errors.global?.[0]?.longMessage;

  function showError(text: string) {
    setMessageTone("error");
    setMessage(text);
  }

  function showSuccess(text: string) {
    setMessageTone("success");
    setMessage(text);
  }

  async function finalizeSignIn() {
    const { error } = await signIn.finalize({
      navigate: () => router.replace("/(tabs)"),
    });

    if (error) {
      if (INVALID_CREDENTIAL_CODES.includes(getClerkErrorCode(error) ?? "")) {
        showError("Email or password is incorrect.");
        return;
      }
      showError(
        getClerkErrorMessage(
          error,
          "We couldn't finish signing you in. Please try again.",
        ),
      );
    }
  }

  async function sendSignInCode() {
    const hasEmailCode = signIn.supportedSecondFactors?.some(
      (factor) => factor.strategy === "email_code",
    );

    if (!hasEmailCode) {
      showError(
        "Your account requires a verification method that isn't available here. Please contact support.",
      );
      return;
    }

    const { error } = await signIn.mfa.sendEmailCode();
    if (error) {
      showError(
        getClerkErrorMessage(
          error,
          "We couldn't send a verification code. Please try again.",
        ),
      );
      return;
    }

    setStep("signInCode");
    showSuccess(`We sent a verification code to ${normalizeEmail(email)}.`);
  }

  async function submitPassword() {
    setMessage(null);

    const emailError = validateEmail(email);
    if (emailError) {
      showError(emailError);
      return;
    }
    if (!password) {
      showError("Enter your password.");
      return;
    }

    try {
      const { error } = await signIn.password({
        emailAddress: normalizeEmail(email),
        password,
      });

      if (error) {
        if (INVALID_CREDENTIAL_CODES.includes(getClerkErrorCode(error) ?? "")) {
          showError("Email or password is incorrect.");
          return;
        }
        showError(
          getClerkErrorMessage(
            error,
            "We couldn't sign you in. Check your email and password.",
          ),
        );
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        await sendSignInCode();
        return;
      }

      showError(
        "Your account needs another verification step. Please try again or contact support.",
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

  async function verifySignInCode() {
    setMessage(null);
    if (!code.trim()) {
      showError("Enter the verification code from your email.");
      return;
    }

    try {
      const { error } = await signIn.mfa.verifyEmailCode({
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

      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      showError(
        "Your account needs another verification step. Please contact support.",
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

  async function resendSignInCode() {
    setMessage(null);
    try {
      const { error } = await signIn.mfa.sendEmailCode();
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

  async function sendPasswordResetCode() {
    setMessage(null);
    const emailError = validateEmail(email);
    if (emailError) {
      showError(emailError);
      return;
    }

    try {
      const { error: createError } = await signIn.create({
        identifier: normalizeEmail(email),
      });
      if (createError) {
        if (getClerkErrorCode(createError) === "form_identifier_not_found") {
          setStep("resetCode");
          showSuccess(resetCodeMessage);
          return;
        }
        showError(
          getClerkErrorMessage(
            createError,
            "We couldn't start password recovery. Please try again.",
          ),
        );
        return;
      }

      const { error: sendError } =
        await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        if (getClerkErrorCode(sendError) === "form_identifier_not_found") {
          setStep("resetCode");
          showSuccess(resetCodeMessage);
          return;
        }
        showError(
          getClerkErrorMessage(
            sendError,
            "We couldn't send a reset code. Please try again.",
          ),
        );
        return;
      }

      setStep("resetCode");
      showSuccess(resetCodeMessage);
    } catch (error) {
      showError(
        getClerkErrorMessage(
          error,
          "We couldn't send a reset code. Please try again.",
        ),
      );
    }
  }

  async function resendPasswordResetCode() {
    setMessage(null);
    try {
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) {
        if (getClerkErrorCode(error) === "form_identifier_not_found") {
          showSuccess(resetCodeMessage);
          return;
        }
        showError(
          getClerkErrorMessage(
            error,
            "We couldn't send another reset code. Please try again.",
          ),
        );
        return;
      }

      showSuccess(resetCodeMessage);
    } catch (error) {
      showError(
        getClerkErrorMessage(
          error,
          "We couldn't send another reset code. Please try again.",
        ),
      );
    }
  }

  async function verifyResetCode() {
    setMessage(null);
    if (!code.trim()) {
      showError("Enter the password reset code from your email.");
      return;
    }

    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
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

      setStep("resetPassword");
      showSuccess("Code verified. Choose a new password.");
    } catch (error) {
      showError(
        getClerkErrorMessage(
          error,
          "We couldn't verify that code. Please try again.",
        ),
      );
    }
  }

  async function submitNewPassword() {
    setMessage(null);
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showError(passwordError);
      return;
    }
    if (newPassword !== confirmation) {
      showError("Your passwords don't match.");
      return;
    }

    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
        signOutOfOtherSessions: true,
      });

      if (error) {
        showError(
          getClerkErrorMessage(
            error,
            "We couldn't update your password. Please try again.",
          ),
        );
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        await sendSignInCode();
        return;
      }

      showError(
        "Your password was updated, but we couldn't finish signing you in. Please return to sign in.",
      );
    } catch (error) {
      showError(
        getClerkErrorMessage(
          error,
          "We couldn't update your password. Please try again.",
        ),
      );
    }
  }

  async function returnToSignIn() {
    setMessage(null);
    setCode("");
    setNewPassword("");
    setConfirmation("");
    try {
      await signIn.reset();
      setStep("password");
    } catch (error) {
      showError(
        getClerkErrorMessage(
          error,
          "We couldn't return to sign in. Please try again.",
        ),
      );
    }
  }

  async function startPasswordReset() {
    setMessage(null);
    setCode("");
    try {
      await signIn.reset();
      setStep("resetEmail");
    } catch (error) {
      showError(
        getClerkErrorMessage(
          error,
          "We couldn't start password recovery. Please try again.",
        ),
      );
    }
  }

  const screenContent = {
    password: {
      title: "Welcome back",
      subtitle: "Sign in to continue managing your subscriptions.",
      footer: (
        <>
          <Text className="auth-link-copy">New to Recurrly?</Text>
          <Pressable
            accessibilityRole="link"
            disabled={isBusy}
            onPress={() => router.replace("/(auth)/signUp")}
          >
            <Text className="auth-link">Create an account</Text>
          </Pressable>
        </>
      ),
    },
    signInCode: {
      title: "Verify it's you",
      subtitle: `Enter the code we sent to ${normalizeEmail(email)}.`,
      footer: (
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={returnToSignIn}
        >
          <Text className="auth-link">Back to sign in</Text>
        </Pressable>
      ),
    },
    resetEmail: {
      title: "Reset your password",
      subtitle: "We'll email you a code to choose a new password.",
      footer: (
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={returnToSignIn}
        >
          <Text className="auth-link">Back to sign in</Text>
        </Pressable>
      ),
    },
    resetCode: {
      title: "Check your inbox",
      subtitle: `Enter the password reset code sent to ${normalizeEmail(email)}.`,
      footer: (
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={returnToSignIn}
        >
          <Text className="auth-link">Back to sign in</Text>
        </Pressable>
      ),
    },
    resetPassword: {
      title: "Choose a new password",
      subtitle: `Create a new password for ${normalizeEmail(email)}.`,
      footer: (
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={returnToSignIn}
        >
          <Text className="auth-link">Back to sign in</Text>
        </Pressable>
      ),
    },
  }[step];

  return (
    <AuthScreen
      title={screenContent.title}
      subtitle={screenContent.subtitle}
      footer={screenContent.footer}
    >
      <View className="auth-form">
        <AuthMessage
          message={message ?? globalError}
          tone={message ? messageTone : "error"}
        />
        {(step === "password" || step === "resetEmail") && (
          <AuthField
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            editable={!isBusy}
            error={
              identifierNotFound ? undefined : errors.fields.identifier?.message
            }
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            onSubmitEditing={() => {
              if (step === "password") {
                TextInput.State.focusTextInput(
                  passwordInputRef.current ?? undefined,
                );
              } else {
                sendPasswordResetCode();
              }
            }}
            placeholder="Enter your email"
            returnKeyType={step === "password" ? "next" : "send"}
            textContentType="emailAddress"
            value={email}
          />
        )}

        {step === "password" && (
          <>
            <AuthField
              autoCapitalize="none"
              autoComplete="current-password"
              editable={!isBusy}
              error={
                invalidCredentials ? undefined : errors.fields.password?.message
              }
              label="Password"
              onChangeText={setPassword}
              onSubmitEditing={submitPassword}
              placeholder="Enter your password"
              ref={passwordInputRef}
              returnKeyType="done"
              secure
              textContentType="password"
              value={password}
            />
            <Pressable
              accessibilityRole="button"
              className="auth-forgot-link"
              disabled={isBusy}
              onPress={startPasswordReset}
            >
              <Text className="auth-link">Forgot password?</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className={
                isBusy ? "auth-button auth-button-disabled" : "auth-button"
              }
              disabled={isBusy}
              onPress={submitPassword}
            >
              {isBusy ? (
                <ActivityIndicator color="#fff9e3" />
              ) : (
                <Text className="auth-button-text">Sign in</Text>
              )}
            </Pressable>
          </>
        )}

        {step === "signInCode" && (
          <>
            <AuthField
              autoCapitalize="none"
              autoComplete="one-time-code"
              editable={!isBusy}
              error={errors.fields.code?.message}
              keyboardType="number-pad"
              label="Verification code"
              maxLength={10}
              onChangeText={setCode}
              onSubmitEditing={verifySignInCode}
              placeholder="Enter the code from your email"
              ref={signInCodeInputRef}
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
              onPress={verifySignInCode}
            >
              {isBusy ? (
                <ActivityIndicator color="#fff9e3" />
              ) : (
                <Text className="auth-button-text">Verify and continue</Text>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="auth-secondary-button"
              disabled={isBusy}
              onPress={resendSignInCode}
            >
              <Text className="auth-secondary-button-text">
                Send a new code
              </Text>
            </Pressable>
          </>
        )}

        {step === "resetEmail" && (
          <Pressable
            accessibilityRole="button"
            className={
              isBusy ? "auth-button auth-button-disabled" : "auth-button"
            }
            disabled={isBusy}
            onPress={sendPasswordResetCode}
          >
            {isBusy ? (
              <ActivityIndicator color="#fff9e3" />
            ) : (
              <Text className="auth-button-text">Send reset code</Text>
            )}
          </Pressable>
        )}

        {step === "resetCode" && (
          <>
            <AuthField
              autoCapitalize="none"
              autoComplete="one-time-code"
              editable={!isBusy}
              error={errors.fields.code?.message}
              keyboardType="number-pad"
              label="Password reset code"
              maxLength={10}
              onChangeText={setCode}
              onSubmitEditing={verifyResetCode}
              placeholder="Enter the code from your email"
              ref={resetCodeInputRef}
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
              onPress={verifyResetCode}
            >
              {isBusy ? (
                <ActivityIndicator color="#fff9e3" />
              ) : (
                <Text className="auth-button-text">Verify code</Text>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="auth-secondary-button"
              disabled={isBusy}
              onPress={resendPasswordResetCode}
            >
              <Text className="auth-secondary-button-text">
                Send a new code
              </Text>
            </Pressable>
          </>
        )}

        {step === "resetPassword" && (
          <>
            <AuthField
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!isBusy}
              error={errors.fields.password?.message}
              label="New password"
              onChangeText={setNewPassword}
              onSubmitEditing={() =>
                TextInput.State.focusTextInput(
                  confirmationInputRef.current ?? undefined,
                )
              }
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              ref={newPasswordInputRef}
              returnKeyType="next"
              secure
              textContentType="newPassword"
              value={newPassword}
            />
            <AuthField
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!isBusy}
              error={
                newPassword && confirmation && newPassword !== confirmation
                  ? "Your passwords don't match."
                  : undefined
              }
              label="Confirm new password"
              onChangeText={setConfirmation}
              onSubmitEditing={submitNewPassword}
              placeholder="Enter your new password again"
              ref={confirmationInputRef}
              returnKeyType="done"
              secure
              textContentType="newPassword"
              value={confirmation}
            />
            <Pressable
              accessibilityRole="button"
              className={
                isBusy ? "auth-button auth-button-disabled" : "auth-button"
              }
              disabled={isBusy}
              onPress={submitNewPassword}
            >
              {isBusy ? (
                <ActivityIndicator color="#fff9e3" />
              ) : (
                <Text className="auth-button-text">Save new password</Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </AuthScreen>
  );
}
