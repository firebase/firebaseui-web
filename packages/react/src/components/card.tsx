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

import type { ComponentProps, PropsWithChildren } from "react";
import { cn } from "~/utils/cn";

/** Props for the Card component. */
export type CardProps = PropsWithChildren<ComponentProps<"div">>;

/**
 * A card container component for grouping related content.
 *
 * @returns The card component.
 */
export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("fui-card", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * The header section of a card.
 *
 * @returns The card header component.
 */
export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("fui-card__header", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * The title of a card.
 *
 * @returns The card title component.
 */
export function CardTitle({ children, className, ...props }: ComponentProps<"h2">) {
  return (
    <h2 className={cn("fui-card__title", className)} {...props}>
      {children}
    </h2>
  );
}

/**
 * The subtitle of a card.
 *
 * @returns The card subtitle component.
 */
export function CardSubtitle({ children, className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("fui-card__subtitle", className)} {...props}>
      {children}
    </p>
  );
}

/**
 * The content section of a card.
 *
 * @returns The card content component.
 */
export function CardContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("fui-card__content", className)} {...props}>
      {children}
    </div>
  );
}
