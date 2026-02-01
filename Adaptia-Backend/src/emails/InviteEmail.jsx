import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
    Img,
    Link,
} from "@react-email/components";
import React from "react";

export const InviteEmail = ({ clinicName = "la clínica", senderName = "Un colega", inviteLink = "#" }) => {
    return (
        <Html>
            <Head />
            <Preview>Únete a {clinicName} en Adaptia</Preview>
            <Tailwind>
                <Body className="bg-[#f4f7f9] py-10 font-sans">
                    <Container className="bg-white border border-[#e5e7eb] rounded-[32px] p-10 max-w-[560px] mx-auto shadow-sm">

                        <Section className="mb-10">
                            {/* Corregido: cellPadding y cellSpacing en CamelCase para React */}
                            <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                                <tr>
                                    <td align="center" style={{
                                        backgroundColor: '#50e3c2',
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '20px'
                                    }}>
                                        <Text className="text-[#101828] font-bold text-3xl m-0 leading-none">A</Text>
                                    </td>
                                </tr>
                            </table>
                        </Section>

                        <Heading className="text-[#101828] text-2xl font-bold text-center mb-6 tracking-tight">
                            Invitación Profesional
                        </Heading>

                        <Text className="text-[#4b5563] text-base leading-relaxed">
                            Hola,
                        </Text>

                        <Text className="text-[#4b5563] text-base leading-relaxed mb-6">
                            <strong className="text-[#101828]">{senderName}</strong> te ha invitado a unirte al equipo médico de <strong className="text-[#101828]">{clinicName}</strong> en la plataforma <strong>Adaptia</strong>.
                        </Text>

                        <Section style={{
                            backgroundColor: '#f9fafb',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '1px solid #f3f4f6',
                            marginBottom: '32px'
                        }}>
                            <Text className="text-[#6b7280] text-sm m-0 leading-relaxed italic text-center">
                                "Al aceptar, podrás gestionar pacientes y citas bajo los protocolos de soberanía de datos de la clínica."
                            </Text>
                        </Section>

                        <Section className="text-center mb-10">
                            {/* Corregido: pX y pY no son props nativas de Button, usamos px y py con Tailwind */}
                            <Button
                                className="bg-[#101828] text-[#50e3c2] px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest no-underline inline-block"
                                href={inviteLink}
                            >
                                Aceptar Invitación
                            </Button>
                        </Section>

                        <Text className="text-[#9ca3af] text-[10px] text-center mb-8">
                            Si el botón no funciona, usa este enlace:
                            <Link href={inviteLink} className="text-[#50e3c2] underline block mt-2 break-all">
                                {inviteLink}
                            </Link>
                        </Text>

                        <Hr className="border-[#f3f4f6] mb-6" />

                        <Text className="text-[#9ca3af] text-[11px] font-bold uppercase tracking-[0.2em] text-center">
                            Adaptia Clinic &bull; Secure Terminal 2026
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default InviteEmail;