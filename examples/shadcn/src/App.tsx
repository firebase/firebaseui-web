/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Link, useNavigate } from "react-router";
import { routes } from "./routes";
import { useUser } from "./firebase/hooks";
import { auth } from "./firebase/firebase";
import { multiFactor, sendEmailVerification, signOut } from "firebase/auth";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Button } from "./components/ui/button";
import { ArrowRightIcon, LockIcon, UserIcon } from "lucide-react";
import React from "react";

function App() {
  const user = useUser();

  if (user) {
    return <AuthenticatedApp />;
  }

  return <UnauthenticatedApp />;
}

function UnauthenticatedApp() {
  return (
    <div className="max-w-sm mx-auto pt-36 space-y-6 pb-36">
      <div className="text-center space-y-4">
        <img src="/firebase-logo-inverted.png" alt="Firebase UI" className="hidden dark:block h-36 mx-auto" />
        <img src="/firebase-logo.png" alt="Firebase UI" className="block dark:hidden h-36 mx-auto" />
        <p className="text-sm text-muted-foreground">
          Welcome to Firebase UI, choose an example screen below to get started!
        </p>
      </div>
      <ItemGroup className="border rounded-md">
        {routes.map((route) => (
          <React.Fragment key={route.path}>
            <Item>
              <ItemContent>
                <ItemTitle>{route.name}</ItemTitle>
                <ItemDescription className="text-xs">{route.description}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Link to={route.path}>
                  <Button size="icon" variant="outline">
                    <ArrowRightIcon />
                  </Button>
                </Link>
              </ItemActions>
            </Item>
            <ItemSeparator />
          </React.Fragment>
        ))}
      </ItemGroup>
    </div>
  );
}

function AuthenticatedApp() {
  const user = useUser()!;
  console.log(user);
  const mfa = multiFactor(user);
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto pt-36 space-y-6 pb-36">
      <ItemGroup className="border rounded-md">
        <Item>
          <ItemMedia variant="icon">
            <UserIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Welcome, {user.displayName || user.email || user.phoneNumber}</ItemTitle>
            <ItemDescription>New login detected from unknown device.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="outline" onClick={async () => await signOut(auth)}>
              Sign Out
            </Button>
          </ItemActions>
          {user.email ? (
            <ItemFooter className="pl-12">
              {user.emailVerified ? (
                <Item>
                  <ItemDescription>Your email is verified.</ItemDescription>
                </Item>
              ) : (
                <>
                  <ItemDescription>Your email is not verified.</ItemDescription>
                  <ItemActions>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        await sendEmailVerification(user);
                        alert("Email verification sent, please check your email");
                      }}
                    >
                      Verify Email &rarr;
                    </Button>
                  </ItemActions>
                </>
              )}
            </ItemFooter>
          ) : null}
        </Item>
        <ItemSeparator />
        <Item>
          <ItemMedia variant="icon">
            <LockIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Multi-factor Authentication</ItemTitle>
            <ItemDescription>
              Any multi-factor authentication factors you have enrolled will be listed here.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigate("/screens/mfa-enrollment-screen");
              }}
            >
              Add Factor
            </Button>
          </ItemActions>
          {mfa.enrolledFactors.length > 0 && (
            <ItemFooter className="pl-12">
              {mfa.enrolledFactors.map((factor) => {
                return (
                  <div key={factor.factorId} className="text-sm text-muted-foreground">
                    {factor.factorId} - {factor.displayName}
                  </div>
                );
              })}
            </ItemFooter>
          )}
        </Item>
      </ItemGroup>
    </div>
  );
}

export default App;
