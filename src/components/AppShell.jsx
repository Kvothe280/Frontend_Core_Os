import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import TerminalIcon from '@mui/icons-material/Terminal';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AvatarUsuario from './AvatarUsuario.jsx';
import HomeDashboard from './HomeDashboard.jsx';
import Terminal from './Terminal.jsx';
import Boveda from './Boveda.jsx';
import Cartas from './Cartas.jsx';
import Recuerdos from './Recuerdos.jsx';
import Calendario from './Calendario.jsx';
import Mensajes from './Mensajes.jsx';

const DRAWER = 268;

const NAV_ITEMS = [
  { id: 'panel', label: 'Inicio', icon: <DashboardOutlinedIcon /> },
  { id: 'cartas', label: 'Cartas', icon: <MailOutlineIcon /> },
  { id: 'recuerdos', label: 'Recuerdos', icon: <PhotoLibraryOutlinedIcon /> },
  { id: 'calendario', label: 'Calendario', icon: <CalendarMonthOutlinedIcon /> },
  { id: 'mensajes', label: 'Mensajes', icon: <ChatBubbleOutlineIcon /> },
  { id: 'terminal', label: 'Terminal', icon: <TerminalIcon /> },
  { id: 'boveda', label: 'Nuestros Vales', icon: <CardGiftcardOutlinedIcon /> },
];

export default function AppShell({ usuario, page, setPage, tick, setTick }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default', color: 'text.primary' }}>
      {!mobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER,
            '& .MuiDrawer-paper': {
              width: DRAWER,
              borderRight: `1px solid ${theme.palette.primary.main}29`,
              background: theme.palette.background.paper,
              px: 1.5,
            },
          }}
        >
          <Box sx={{ px: 1.5, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AvatarUsuario usuario={usuario} size={44} editable />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="overline"
                sx={{ color: theme.palette.primary.main, letterSpacing: '0.22em', display: 'block', lineHeight: 1.2 }}
              >
                CORE OS
              </Typography>
              <Typography variant="h6" sx={{ lineHeight: 1.15, fontStyle: 'italic', color: 'primary.main' }}>
                Nuestro sistema
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, mb: 1 }}>
            Juntos desde el 18 de febrero
          </Typography>
          <List>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.id}
                selected={page === item.id}
                onClick={() => setPage(item.id)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': { backgroundColor: `${theme.palette.primary.main}1f` },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.primary.main }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          p: { xs: 2, md: 3 },
          pb: { xs: '76px', md: 3 },
          bgcolor: 'background.default',
          color: 'text.primary',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ height: '100%' }}
          >
            {page === 'panel' && (
              <HomeDashboard
                tick={tick}
                usuario={usuario}
                onOpenCartas={() => setPage('cartas')}
                onOpenRecuerdos={() => setPage('recuerdos')}
              />
            )}
            {page === 'cartas' && <Cartas usuario={usuario} />}
            {page === 'recuerdos' && <Recuerdos onChange={() => setTick((n) => n + 1)} />}
            {page === 'calendario' && <Calendario usuario={usuario} />}
            {page === 'mensajes' && <Mensajes usuario={usuario} />}
            {page === 'terminal' && <Terminal usuario={usuario} />}
            {page === 'boveda' && <Boveda tick={tick} />}
          </motion.div>
        </AnimatePresence>
      </Box>

      {mobile && (
        <BottomNavigation
          value={page}
          onChange={(_, v) => setPage(v)}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderTop: `1px solid ${theme.palette.primary.main}29`,
            bgcolor: theme.palette.background.paper,
            height: 60,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.id}
              value={item.id}
              icon={item.icon}
              sx={{
                minWidth: 0,
                px: 0.5,
                color: page === item.id ? theme.palette.primary.main : 'text.disabled',
                '&.Mui-selected': { color: theme.palette.primary.main },
              }}
            />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
}
