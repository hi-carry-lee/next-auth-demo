"use client";

// import { useCallback, useEffect, useState, useRef } from "react";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";

import { newVerification } from "@/actions/new-verification";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/form/form-error";
import { FormSuccess } from "@/components/form/form-success";

// Used to verify the token sent by email when register or login;
export const NewVerificationForm = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // why use this code? since AI said the original code may cause cycle dependency
  useEffect(() => {
    // 避免重复处理
    let isMounted = true;

    if (!token) {
      setError("Missing token!");
      return;
    }

    // 只在组件首次挂载时执行验证
    newVerification(token)
      .then((data) => {
        if (isMounted) {
          setSuccess(data.success ?? "");
          setError(data.error ?? "");
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Something went wrong!");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]); // 只依赖 token

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};

/*
// 使用useRef存储状态的当前值
  const successRef = useRef(success);
  const errorRef = useRef(error);

  // 同步ref与状态值
  useEffect(() => {
    successRef.current = success;
    errorRef.current = error;
  }, [success, error]);

  // must use useCallback, or it will create a new function instance every time after re-render,
  // and a new function instance will trigger useEffect again, then get a infinite cycle
  const onSubmit = useCallback(() => {
    // 使用ref值而非直接使用state
    if (successRef.current || errorRef.current) return;

    if (!token) {
      setError("Missing token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success ?? "");
        setError(data.error ?? "");
      })
      .catch(() => {
        setError("Something went wrong!");
      });
  }, [token]); // 只依赖token，不需要添加success和error

  // 调用onSubmit -- 这部分缺失了
  useEffect(() => {
    onSubmit();
  }, [onSubmit]);
*/

/*
// original code
const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Missing token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Something went wrong!");
      })
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);
*/
