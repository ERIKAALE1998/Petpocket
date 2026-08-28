// @ts-nocheck
import { useState, useEffect } from "react";
import { becomeVetBusiness, getBusinessProfile, getCustomerPortalUrl, useQuery } from "wasp/client/operations";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import type { User } from "wasp/entities";
import { Stethoscope, Building2, MapPin, Phone, Compass, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../client/components/ui/card";
import { Separator } from "../client/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../client/components/ui/dialog";
import { Input } from "../client/components/ui/input";
import { Label } from "../client/components/ui/label";
import { Textarea } from "../client/components/ui/textarea";
import { useToast } from "../client/hooks/use-toast";
import {
  PaymentPlanId,
  SubscriptionStatus,
  parsePaymentPlanId,
  prettyPaymentPlanName,
} from "../payment/plans";

export function AccountPage({ user }: { user: User }) {
  return (
    <div className="mt-10 px-6">
      <Card className="mb-4 lg:m-8">
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold leading-6">
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {!!user.email && (
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                  <div className="text-muted-foreground text-sm font-medium">
                    Email address
                  </div>
                  <div className="text-foreground mt-1 text-sm sm:col-span-2 sm:mt-0">
                    {user.email}
                  </div>
                </div>
              </div>
            )}
            {!!user.username && (
              <>
                <Separator />
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                    <div className="text-muted-foreground text-sm font-medium">
                      Username
                    </div>
                    <div className="text-foreground mt-1 text-sm sm:col-span-2 sm:mt-0">
                      {user.username}
                    </div>
                  </div>
                </div>
              </>
            )}
            <Separator />
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                <div className="text-muted-foreground text-sm font-medium">
                  Your Plan
                </div>
                <UserCurrentSubscriptionPlan
                  subscriptionPlan={user.subscriptionPlan}
                  subscriptionStatus={user.subscriptionStatus}
                  datePaid={user.datePaid}
                />
              </div>
            </div>
            <Separator />
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                <div className="text-muted-foreground text-sm font-medium">
                  Credits
                </div>
                <div className="text-foreground mt-1 text-sm sm:col-span-1 sm:mt-0">
                  {user.credits} credits
                </div>
                <div className="ml-auto mt-4 sm:mt-0">
                  <BuyMoreButton subscriptionStatus={user.subscriptionStatus} />
                </div>
              </div>
            </div>
            <Separator />
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                <div className="text-muted-foreground text-sm font-medium">
                  About
                </div>
                <div className="text-foreground mt-1 text-sm sm:col-span-2 sm:mt-0">
                  I'm a cool customer.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <BecomeVetBusinessCard user={user} />
    </div>
  );
}

function BecomeVetBusinessCard({ user }: { user: User }) {
  const { data: businessProfile, refetch } = useQuery(getBusinessProfile, {});
  const [isOpen, setIsOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (businessProfile) {
      setFormData({
        name: businessProfile.name || "",
        address: businessProfile.address || "",
        phone: businessProfile.phone || "",
        description: businessProfile.description || "",
        latitude: businessProfile.latitude !== undefined && businessProfile.latitude !== null ? String(businessProfile.latitude) : "",
        longitude: businessProfile.longitude !== undefined && businessProfile.longitude !== null ? String(businessProfile.longitude) : "",
      });
    }
  }, [businessProfile]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("La geolocalización no está soportada por su navegador.");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setIsGettingLocation(false);
      },
      (error) => {
        console.error(error);
        setErrorMsg("No se pudo obtener la ubicación GPS.");
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (!formData.name || !formData.address || !formData.phone) {
      setErrorMsg("Por favor complete los campos obligatorios (Nombre, Dirección, Teléfono).");
      return;
    }

    if (isNaN(lat) || isNaN(lng)) {
      setErrorMsg("Por favor ingrese coordenadas válidas (Latitud y Longitud).");
      return;
    }

    setIsSubmitting(true);
    try {
      await becomeVetBusiness({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        description: formData.description || undefined,
        latitude: lat,
        longitude: lng,
      });

      toast({
        title: "¡Éxito!",
        description: "Tu cuenta ha sido actualizada como Veterinaria.",
      });

      setIsOpen(false);
      await refetch();
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocurrió un error al registrar la veterinaria.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVet = user.role === "VET_BUSINESS";

  return (
    <Card className="mb-4 lg:m-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground text-base font-semibold leading-6">
              Perfil de Veterinaria
            </CardTitle>
          </div>
          {isVet && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Veterinaria Registrada
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isVet && businessProfile ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4 border-b pb-3">
              <span className="text-muted-foreground text-sm font-medium">Nombre de Clínica</span>
              <span className="text-foreground text-sm font-semibold sm:col-span-2">{businessProfile.name}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4 border-b pb-3">
              <span className="text-muted-foreground text-sm font-medium">Dirección</span>
              <span className="text-foreground text-sm sm:col-span-2">{businessProfile.address}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4 border-b pb-3">
              <span className="text-muted-foreground text-sm font-medium">Teléfono</span>
              <span className="text-foreground text-sm sm:col-span-2">{businessProfile.phone}</span>
            </div>
            {businessProfile.description && (
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4 border-b pb-3">
                <span className="text-muted-foreground text-sm font-medium">Descripción</span>
                <span className="text-foreground text-sm sm:col-span-2">{businessProfile.description}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4 pb-2">
              <span className="text-muted-foreground text-sm font-medium">Coordenadas GPS</span>
              <span className="text-foreground text-sm sm:col-span-2">
                {businessProfile.latitude}, {businessProfile.longitude}
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Editar Perfil de Veterinaria</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[520px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      Editar Perfil de Veterinaria
                    </DialogTitle>
                    <DialogDescription>
                      Actualiza los datos de tu establecimiento.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {errorMsg && (
                      <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="vet-name-edit">Nombre de la Veterinaria *</Label>
                      <Input
                        id="vet-name-edit"
                        placeholder="Ej. Clínica Veterinaria San Miguel"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="vet-address-edit">Dirección Física *</Label>
                        <Input
                          id="vet-address-edit"
                          placeholder="Calle Principal #123"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="vet-phone-edit">Teléfono de Contacto *</Label>
                        <Input
                          id="vet-phone-edit"
                          placeholder="+52 555 123 4567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="vet-desc-edit">Descripción o Servicios (Opcional)</Label>
                      <Textarea
                        id="vet-desc-edit"
                        placeholder="Servicios ofrecidos, emergencias 24h, vacunas, etc."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2 pt-1 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">Ubicación GPS *</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-primary hover:text-primary/80 flex items-center gap-1"
                          onClick={handleGetCurrentLocation}
                          disabled={isGettingLocation}
                        >
                          {isGettingLocation ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Compass className="h-3 w-3" />
                          )}
                          Obtener GPS actual
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="vet-lat-edit" className="text-xs text-muted-foreground">Latitud</Label>
                          <Input
                            id="vet-lat-edit"
                            type="number"
                            step="any"
                            placeholder="19.432608"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="vet-lng-edit" className="text-xs text-muted-foreground">Longitud</Label>
                          <Input
                            id="vet-lng-edit"
                            type="number"
                            step="any"
                            placeholder="-99.133209"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="pt-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          "Actualizar Datos"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-accent/40 border">
            <div>
              <h4 className="font-semibold text-foreground text-sm">¿Eres un profesional o dueño de Clínica Veterinaria?</h4>
              <p className="text-muted-foreground text-xs mt-1">
                Registra tu negocio para que los usuarios y clientes cercanos puedan ubicar tu veterinaria en el mapa de Petpocket.
              </p>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Registrarse como Veterinaria
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Registrar Clínica Veterinaria
                  </DialogTitle>
                  <DialogDescription>
                    Ingresa los datos de tu establecimiento de salud animal.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                  {errorMsg && (
                    <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="vet-name">Nombre de la Veterinaria *</Label>
                    <Input
                      id="vet-name"
                      placeholder="Ej. Clínica Veterinaria San Miguel"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="vet-address">Dirección Física *</Label>
                      <Input
                        id="vet-address"
                        placeholder="Calle Principal #123"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="vet-phone">Teléfono de Contacto *</Label>
                      <Input
                        id="vet-phone"
                        placeholder="+52 555 123 4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="vet-desc">Descripción o Servicios (Opcional)</Label>
                    <Textarea
                      id="vet-desc"
                      placeholder="Servicios ofrecidos, emergencias 24h, vacunas, etc."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2 pt-1 border-t">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Ubicación GPS *</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-primary hover:text-primary/80 flex items-center gap-1"
                        onClick={handleGetCurrentLocation}
                        disabled={isGettingLocation}
                      >
                        {isGettingLocation ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Compass className="h-3 w-3" />
                        )}
                        Obtener GPS actual
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="vet-lat" className="text-xs text-muted-foreground">Latitud</Label>
                        <Input
                          id="vet-lat"
                          type="number"
                          step="any"
                          placeholder="19.432608"
                          value={formData.latitude}
                          onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="vet-lng" className="text-xs text-muted-foreground">Longitud</Label>
                        <Input
                          id="vet-lng"
                          type="number"
                          step="any"
                          placeholder="-99.133209"
                          value={formData.longitude}
                          onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Confirmar Registro"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UserCurrentSubscriptionPlan({
  subscriptionPlan,
  subscriptionStatus,
  datePaid,
}: Pick<User, "subscriptionPlan" | "subscriptionStatus" | "datePaid">) {
  let subscriptionPlanMessage = "Free Plan";
  if (
    subscriptionPlan !== null &&
    subscriptionStatus !== null &&
    datePaid !== null
  ) {
    subscriptionPlanMessage = formatSubscriptionStatusMessage(
      parsePaymentPlanId(subscriptionPlan),
      datePaid,
      subscriptionStatus as SubscriptionStatus,
    );
  }

  return (
    <>
      <div className="text-foreground mt-1 text-sm sm:col-span-1 sm:mt-0">
        {subscriptionPlanMessage}
      </div>
      <div className="ml-auto mt-4 sm:mt-0">
        <CustomerPortalButton />
      </div>
    </>
  );
}

function formatSubscriptionStatusMessage(
  subscriptionPlan: PaymentPlanId,
  datePaid: Date,
  subscriptionStatus: SubscriptionStatus,
): string {
  const paymentPlanName = prettyPaymentPlanName(subscriptionPlan);
  const statusToMessage: Record<SubscriptionStatus, string> = {
    active: `${paymentPlanName}`,
    past_due: `Payment for your ${paymentPlanName} plan is past due! Please update your subscription payment information.`,
    cancel_at_period_end: `Your ${paymentPlanName} plan subscription has been canceled, but remains active until the end of the current billing period: ${prettyPrintEndOfBillingPeriod(
      datePaid,
    )}`,
    deleted: `Your previous subscription has been canceled and is no longer active.`,
  };

  if (!statusToMessage[subscriptionStatus]) {
    throw new Error(`Invalid subscription status: ${subscriptionStatus}`);
  }

  return statusToMessage[subscriptionStatus];
}

function prettyPrintEndOfBillingPeriod(datePaid: Date) {
  const lastDayOfNextMonth = new Date(datePaid);
  lastDayOfNextMonth.setMonth(lastDayOfNextMonth.getMonth() + 2, 0);
  // Clamped so e.g., Jan 31 + 1 month → Feb 28, not until March 3.
  const clampedDayOfMonth = Math.min(
    datePaid.getDate(),
    lastDayOfNextMonth.getDate(),
  );
  const endOfBillingPeriod = new Date(datePaid);
  endOfBillingPeriod.setMonth(
    endOfBillingPeriod.getMonth() + 1,
    clampedDayOfMonth,
  );
  return endOfBillingPeriod.toLocaleDateString();
}

function CustomerPortalButton() {
  const { data: customerPortalUrl, isLoading: isCustomerPortalUrlLoading } =
    useQuery(getCustomerPortalUrl);

  if (!customerPortalUrl) {
    return null;
  }

  return (
    <a href={customerPortalUrl} target="_blank" rel="noopener noreferrer">
      <Button disabled={isCustomerPortalUrlLoading} variant="link">
        Manage Payment Details
      </Button>
    </a>
  );
}

function BuyMoreButton({
  subscriptionStatus,
}: Pick<User, "subscriptionStatus">) {
  if (
    subscriptionStatus === SubscriptionStatus.Active ||
    subscriptionStatus === SubscriptionStatus.CancelAtPeriodEnd
  ) {
    return null;
  }

  return (
    <WaspRouterLink
      to={"/pets"}
      className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
    >
      <Button variant="link">Buy More Credits</Button>
    </WaspRouterLink>
  );
}
