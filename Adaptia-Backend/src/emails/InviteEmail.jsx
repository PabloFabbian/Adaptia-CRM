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
} from "@react-email/components";

export const InviteEmail = ({ clinicName, senderName, inviteLink }) => {
    return (
        <Html>
            <Head />
            <Preview>Invitación a colaborar en {clinicName}</Preview>
            <Tailwind>
                <Body className="bg-white dark:bg-[#101828] my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] dark:border-[#1e293b] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px]">
                            <div className="bg-[#50e3c2] w-12 h-12 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <span className="text-gray-900 font-bold text-xl">A</span>
                            </div>
                        </Section>
                        <Heading className="text-black dark:text-white text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Invitación a <strong>{clinicName}</strong>
                        </Heading>
                        <Text className="text-black dark:text-gray-300 text-[14px] leading-[24px]">
                            Hola,
                        </Text>
                        <Text className="text-black dark:text-gray-300 text-[14px] leading-[24px]">
                            <strong>{senderName}</strong> te ha invitado a unirte a su red profesional en <strong>Adaptia</strong>.
                            Al aceptar, podrás gestionar pacientes y citas manteniendo siempre la soberanía y privacidad de tus datos profesionales.
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#101828] dark:bg-[#50e3c2] rounded text-white dark:text-[#101828] text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={inviteLink}
                            >
                                Aceptar Invitación y Registrarse
                            </Button>
                        </Section>
                        <Text className="text-black dark:text-gray-300 text-[14px] leading-[24px]">
                            O copia y pega esta URL en tu navegador:{" "}
                            <a href={inviteLink} className="text-blue-600 dark:text-[#50e3c2] no-underline">
                                {inviteLink}
                            </a>
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] dark:border-[#1e293b] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] dark:text-gray-500 text-[12px] leading-[24px]">
                            Este mensaje fue enviado por el sistema de gestión de Adaptia. Si no esperabas esta invitación, puedes ignorar este correo.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default InviteEmail;