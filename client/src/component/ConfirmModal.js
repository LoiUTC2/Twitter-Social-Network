import React from 'react';
import { Modal, Button } from 'antd';

const ConfirmModal = ({ title, text, visible, onOk, onCancel }) => {

    return (
        <Modal
            title={title}
            visible={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button key="ok" type="primary" onClick={onOk}>
                    OK
                </Button>,
            ]}
        >
            <p>{text}</p>
        </Modal>
    );
};

export default ConfirmModal;
