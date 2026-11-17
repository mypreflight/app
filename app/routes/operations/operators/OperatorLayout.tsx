import type { Route } from ".react-router/types/app/routes/operations/operators/+types/OperatorLayout";
import { Button } from "flowbite-react";
import React from "react";
import { HiPencil } from "react-icons/hi";
import { Link, Outlet, useLoaderData, useLocation, useNavigate, useSearchParams } from "react-router";
import { UpdateOperatorModal } from "~/features/operator/components/Forms/UpdateOperatorModal";
import { OperatorHeader } from "~/features/operator/components/Header/OperatorHeader";
import { OperatorTabs } from "~/features/operator/components/Table/Tabs/OperatorTabs";
import {
  activeOperatorTab,
  isOperatorEditRequested,
  operatorCrumbs,
  operatorEditPath,
} from "~/features/operator/navigation";
import { OperatorService } from "~/features/operator/service";
import { usePageTitle } from "~/shared/hooks/usePageTitle";
import { PageHeader } from "~/shared/ui/Shell/PageHeader";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const operator = await new OperatorService().fetchById(params.operatorId);
  return { operator };
}

export default function OperatorLayout() {
  const { operator } = useLoaderData<typeof clientLoader>();
  usePageTitle(`${operator.shortName} | Operator`);

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        crumbs={operatorCrumbs(operator, activeOperatorTab(pathname))}
        actions={
          <Button as={Link} color="alternative" to={operatorEditPath(pathname)} className="space-x-1.5" size="xs">
            <HiPencil />
            <span>Edit operator</span>
          </Button>
        }
      />

      <OperatorHeader operator={operator} />

      <OperatorTabs id={operator.id} />

      <Outlet />

      {isOperatorEditRequested(searchParams) && (
        <UpdateOperatorModal operator={operator} close={() => navigate(pathname)} />
      )}
    </>
  );
}
