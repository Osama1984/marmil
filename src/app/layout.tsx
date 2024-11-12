import Body from "@/app/LayoutComponents/Body"
import Header from "@/app/LayoutComponents/Header"

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
      <Header>
      <Body>
        {children}
      </Body>
      </Header>
  )
}

export default RootLayout;