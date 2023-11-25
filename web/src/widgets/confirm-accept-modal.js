import React from 'react'
import { Modal, Form, Input, InputNumber } from "antd";
const FormItem = Form.Item

const ContactForm = Form.create()(
	(props) => {
		const { visible, onCancel, onAccept, form } = props
		const { getFieldDecorator } = form
		return (
			<Modal
				visible={visible}
				title="GamesOnStakes"
				okText="Accept"
				cancelText="Cancel"
				onCancel={onCancel}
				onOk={onAccept}
			>
				<Form layout="vertical">
					<p>To accept the game, choose a nick name and provide a random number.</p>
					<FormItem>
						{getFieldDecorator('nick', {
							rules: [{ required: true, message: 'Please, choose a nick name' }],
						})(
							<Input placeholder="Nick name" />
						)}
					</FormItem>
					<FormItem>
						{getFieldDecorator('number', {
							rules: [{ required: true, message: 'Please, enter a random number to accept the game' }],
						})(
							<InputNumber min={0} className="width-100" placeholder="Random number" />
						)}
					</FormItem>
				</Form>
			</Modal>
		)
	}
)

export default ContactForm
